package com.adprod.inventar.security;

import com.adprod.inventar.security.interfaces.ITokenValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@AllArgsConstructor
public class TokenValidator implements ITokenValidator {

    private final JwtManager jwtManager;

    @Override
    public boolean isTokenValid(String token) {
        return Objects.nonNull(token) && token.startsWith("Bearer ") && jwtManager.validateToken(token.substring(7));
    }
}
