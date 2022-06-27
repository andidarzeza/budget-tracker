package com.adprod.inventar.security.interfaces;

public interface ITokenValidator {
    boolean isTokenValid(String token);
}
