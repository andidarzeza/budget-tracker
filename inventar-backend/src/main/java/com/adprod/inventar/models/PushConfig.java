package com.adprod.inventar.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** The server's VAPID key pair for Web Push, created on first use (single row, id "vapid"). */
@Document("push_config")
@Getter
@Setter
public class PushConfig {
    @Id
    private String id;
    /** Uncompressed P-256 public key, base64url — handed to browsers as applicationServerKey. */
    private String publicKey;
    /** P-256 private key scalar, base64url. */
    private String privateKey;
}
