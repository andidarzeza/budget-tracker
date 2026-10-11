package com.adprod.inventar.services;

import com.adprod.inventar.models.PushSubscription;

import java.util.Map;

public interface WebPushService {
    /** VAPID public key (base64url) for the browser's pushManager.subscribe(). */
    String publicKey();

    /** Save (or re-own) a subscription for the current user. */
    void subscribe(PushSubscription subscription);

    /** Forget a subscription of the current user. */
    void unsubscribe(String endpoint);

    /** Whether this endpoint is subscribed for the current user. */
    boolean isSubscribed(String endpoint);

    /** Send to the current user's devices; returns how many accepted it. */
    int sendToCurrentUser(Map<String, Object> payload);

    /** Send to every subscribed device; returns how many accepted it. */
    int sendToAll(Map<String, Object> payload);
}
