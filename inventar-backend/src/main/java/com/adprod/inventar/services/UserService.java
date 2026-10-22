package com.adprod.inventar.services;

import com.adprod.inventar.models.UserRequest;
import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity<Object> register(UserRequest userRequest, String clientAddress);
    ResponseEntity<Object> login(UserRequest userRequest, String clientAddress);
}
