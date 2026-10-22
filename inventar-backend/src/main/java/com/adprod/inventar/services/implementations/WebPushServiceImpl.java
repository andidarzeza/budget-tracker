package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.PushConfig;
import com.adprod.inventar.models.PushSubscription;
import com.adprod.inventar.repositories.PushConfigRepository;
import com.adprod.inventar.repositories.PushSubscriptionRepository;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WebPushService;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import nl.martijndwars.webpush.Encoding;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Web Push (VAPID) sender. The key pair is generated once and kept in the database, so there is
 * nothing to configure; subscriptions that the push service reports as gone (404 / 410) are
 * removed.
 */
@Service
public class WebPushServiceImpl implements WebPushService {

    private static final Logger log = LoggerFactory.getLogger(WebPushServiceImpl.class);
    private static final String CONFIG_ID = "vapid";
    /** Browsers' push services (Chrome, Firefox, Safari, Edge); nothing else is ever called. */
    private static final List<String> PUSH_SERVICE_HOSTS = List.of(
            "fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com", "notify.windows.com");
    /** Contact for the push services, required by VAPID. */
    private static final String SUBJECT = "mailto:notifications@financa.cloud";

    private final PushSubscriptionRepository subscriptionRepository;
    private final PushConfigRepository configRepository;
    private final SecurityContextService securityContextService;
    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private volatile PushService pushService;
    private volatile String publicKey;

    public WebPushServiceImpl(PushSubscriptionRepository subscriptionRepository,
                              PushConfigRepository configRepository,
                              SecurityContextService securityContextService) {
        this.subscriptionRepository = subscriptionRepository;
        this.configRepository = configRepository;
        this.securityContextService = securityContextService;
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Override
    public String publicKey() {
        ensureKeys();
        return publicKey;
    }

    @Override
    public void subscribe(PushSubscription subscription) {
        if (subscription.getEndpoint() == null || subscription.getP256dh() == null || subscription.getAuth() == null) {
            throw new IllegalArgumentException("Incomplete push subscription.");
        }
        if (!isPushService(subscription.getEndpoint())) {
            throw new IllegalArgumentException("Not a browser push service endpoint.");
        }
        String user = securityContextService.username();
        PushSubscription row = subscriptionRepository.findByEndpoint(subscription.getEndpoint()).orElseGet(PushSubscription::new);
        // Another user's device subscription moves over only to whoever has its keys — the same
        // browser, signed in as someone else — never to someone who merely knows the endpoint.
        if (row.getUser() != null && !row.getUser().equals(user)
                && !(Objects.equals(row.getP256dh(), subscription.getP256dh()) && Objects.equals(row.getAuth(), subscription.getAuth()))) {
            throw new IllegalArgumentException("Push subscription keys do not match.");
        }
        row.setUser(user);
        row.setEndpoint(subscription.getEndpoint());
        row.setP256dh(subscription.getP256dh());
        row.setAuth(subscription.getAuth());
        row.setUserAgent(subscription.getUserAgent());
        subscriptionRepository.save(row);
    }

    @Override
    public void unsubscribe(String endpoint) {
        subscriptionRepository.deleteByEndpointAndUser(endpoint, securityContextService.username());
    }

    @Override
    public boolean isSubscribed(String endpoint) {
        String user = securityContextService.username();
        return subscriptionRepository.findByEndpoint(endpoint).map(s -> user.equals(s.getUser())).orElse(false);
    }

    @Override
    public int sendToCurrentUser(Map<String, Object> payload) {
        return send(subscriptionRepository.findAllByUser(securityContextService.username()), payload);
    }

    @Override
    public int sendToAll(Map<String, Object> payload) {
        return send(subscriptionRepository.findAll(), payload);
    }

    private int send(List<PushSubscription> targets, Map<String, Object> payload) {
        if (targets.isEmpty()) return 0;
        ensureKeys();
        byte[] body;
        try {
            body = objectMapper.writeValueAsBytes(payload);
        } catch (Exception e) {
            throw new IllegalStateException("Could not encode push payload", e);
        }
        int delivered = 0;
        for (PushSubscription s : targets) {
            try {
                Notification notification = new Notification(s.getEndpoint(), s.getP256dh(), s.getAuth(), body);
                // aes128gcm (RFC 8291) — the only encoding Apple's push service accepts; the
                // library's default is the old draft "aesgcm".
                HttpResponse response = pushService.send(notification, Encoding.AES128GCM);
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    subscriptionRepository.delete(s); // the device unsubscribed or the app was removed
                } else if (status >= 200 && status < 300) {
                    delivered++;
                } else {
                    log.warn("Push to {} rejected with HTTP {}", host(s.getEndpoint()), status);
                }
            } catch (Exception e) {
                log.warn("Push to {} failed: {}", host(s.getEndpoint()), e.getMessage());
            }
        }
        return delivered;
    }

    /** Load the VAPID key pair, creating and storing it the first time. */
    private synchronized void ensureKeys() {
        if (pushService != null) return;
        try {
            PushConfig config = configRepository.findById(CONFIG_ID).orElseGet(this::createKeys);
            pushService = new PushService(config.getPublicKey(), config.getPrivateKey(), SUBJECT);
            publicKey = config.getPublicKey();
        } catch (Exception e) {
            throw new IllegalStateException("Could not set up Web Push keys", e);
        }
    }

    private PushConfig createKeys() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("ECDH", BouncyCastleProvider.PROVIDER_NAME);
            generator.initialize(ECNamedCurveTable.getParameterSpec("prime256v1"));
            KeyPair pair = generator.generateKeyPair();
            Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
            PushConfig config = new PushConfig();
            config.setId(CONFIG_ID);
            config.setPublicKey(b64.encodeToString(Utils.encode((ECPublicKey) pair.getPublic())));
            config.setPrivateKey(b64.encodeToString(Utils.encode((ECPrivateKey) pair.getPrivate())));
            log.info("Generated Web Push (VAPID) keys.");
            return configRepository.save(config);
        } catch (Exception e) {
            throw new IllegalStateException("Could not generate Web Push keys", e);
        }
    }

    private static String host(String endpoint) {
        try {
            return URI.create(endpoint).getHost();
        } catch (Exception e) {
            return "push service";
        }
    }

    static boolean isPushService(String endpoint) {
        try {
            URI uri = URI.create(endpoint);
            String host = uri.getHost();
            return "https".equalsIgnoreCase(uri.getScheme()) && host != null && uri.getPort() == -1
                    && PUSH_SERVICE_HOSTS.stream().anyMatch(h -> host.equalsIgnoreCase(h) || host.toLowerCase().endsWith("." + h));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
