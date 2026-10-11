package com.adprod.inventar.resources;

import com.adprod.inventar.models.PushSubscription;
import com.adprod.inventar.services.WebPushService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Phone / browser push notifications (currently: EUR sell rate at a new low). */
@AllArgsConstructor
@RestController
@RequestMapping("/api/push")
public class PushResource {

    private final WebPushService webPushService;

    @GetMapping("/public-key")
    public ResponseEntity<?> publicKey() {
        return ResponseEntity.ok(Map.of("publicKey", webPushService.publicKey()));
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscription subscription) {
        webPushService.subscribe(subscription);
        return ResponseEntity.ok(Map.of("subscribed", true));
    }

    @PostMapping("/subscriptions/status")
    public ResponseEntity<?> status(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("subscribed", webPushService.isSubscribed(body.get("endpoint"))));
    }

    @PostMapping("/subscriptions/remove")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> body) {
        webPushService.unsubscribe(body.get("endpoint"));
        return ResponseEntity.ok(Map.of("subscribed", false));
    }

    @PostMapping("/test")
    public ResponseEntity<?> test() {
        int delivered = webPushService.sendToCurrentUser(Map.of(
                "title", "Financa",
                "body", "Notifications are working. You'll hear from us when the euro hits a new low.",
                "url", "/exchange",
                "tag", "test"));
        return ResponseEntity.ok(Map.of("delivered", delivered));
    }
}
