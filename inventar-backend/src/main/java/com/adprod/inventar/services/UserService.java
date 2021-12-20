package com.adprod.inventar.services;

import com.adprod.inventar.models.UserRequest;
import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity<Object> register(UserRequest userRequest);
    ResponseEntity<Object> login(UserRequest userRequest);
    ResponseEntity<Object> getAllUsers();
    ResponseEntity<Object> deleteUser(String userID);
    ResponseEntity<Object> updateUser(String newUsername, String username);
}