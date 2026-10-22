package com.adprod.inventar.security;

import com.adprod.inventar.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Date;
import java.util.Optional;

/** Signs and checks the login tokens (HS256). */
@Slf4j
@Component
public class JwtManager {

    private static final Duration TOKEN_LIFETIME = Duration.ofDays(7);

    private final SecretKey key;

    /**
     * The key comes from the JWT_SECRET environment variable (at least 32 characters).
     * Without one — local development — a random key is made at startup, so restarting
     * the server signs everyone out.
     */
    public JwtManager(@Value("${jwt.secret:}") String secret) {
        if (secret.isBlank()) {
            log.warn("JWT_SECRET is not set: using a random key; logins end when the server restarts.");
            byte[] random = new byte[32];
            new SecureRandom().nextBytes(random);
            this.key = Keys.hmacShaKeyFor(random);
        } else {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                throw new IllegalStateException("JWT_SECRET must be at least 32 characters long.");
            }
            this.key = Keys.hmacShaKeyFor(bytes);
        }
    }

    public String createToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + TOKEN_LIFETIME.toMillis()))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** The username of a valid, unexpired token; empty for anything else. */
    public Optional<String> username(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
