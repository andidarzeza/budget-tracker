package com.adprod.inventar.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * A browser / home-screen app that asked for push notifications. The fields are what the
 * browser's {@code PushSubscription.toJSON()} gives: an endpoint plus the two keys used to
 * encrypt each message for it.
 */
@Document("push_subscriptions")
@Getter
@Setter
public class PushSubscription {
    @Id
    private String id;
    private String user;
    @Indexed(unique = true)
    private String endpoint;
    private String p256dh;
    private String auth;
    private String userAgent;
    private Date createdTime = new Date();
}
