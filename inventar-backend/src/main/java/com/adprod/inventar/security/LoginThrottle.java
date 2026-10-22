package com.adprod.inventar.security;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Slows down password guessing and account creation: too many failed logins for a username
 * or from an address, or too many sign-ups from an address, are refused (429) for a while.
 * Kept in memory: a restart clears it, which is fine for a single server.
 */
@Component
public class LoginThrottle {

    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_FAILURES_PER_USERNAME = 5;
    private static final int MAX_FAILURES_PER_ADDRESS = 20;
    private static final Duration SIGN_UP_WINDOW = Duration.ofHours(1);
    private static final int MAX_SIGN_UPS_PER_ADDRESS = 5;

    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    public void checkLogin(String username, String address) {
        refuseIfOver("user:" + normalize(username), MAX_FAILURES_PER_USERNAME, WINDOW);
        refuseIfOver("ip:" + address, MAX_FAILURES_PER_ADDRESS, WINDOW);
    }

    public void loginFailed(String username, String address) {
        count("user:" + normalize(username), WINDOW);
        count("ip:" + address, WINDOW);
    }

    public void loginSucceeded(String username) {
        counters.remove("user:" + normalize(username));
    }

    /** Counts the attempt too, successful or not. */
    public void checkSignUp(String address) {
        refuseIfOver("signup:" + address, MAX_SIGN_UPS_PER_ADDRESS, SIGN_UP_WINDOW);
        count("signup:" + address, SIGN_UP_WINDOW);
    }

    @Scheduled(fixedRate = 15 * 60 * 1000)
    void forgetExpired() {
        Instant now = Instant.now();
        counters.values().removeIf(counter -> counter.expires.isBefore(now));
    }

    private void refuseIfOver(String key, int limit, Duration window) {
        Counter counter = counters.get(key);
        if (counter != null && counter.expires.isAfter(Instant.now()) && counter.count >= limit) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again later.");
        }
    }

    private void count(String key, Duration window) {
        Instant now = Instant.now();
        counters.compute(key, (k, counter) -> counter == null || counter.expires.isBefore(now)
                ? new Counter(1, now.plus(window))
                : new Counter(counter.count + 1, counter.expires));
    }

    private static String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    private record Counter(int count, Instant expires) {
    }
}
