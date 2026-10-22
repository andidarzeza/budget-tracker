package com.adprod.inventar.resources;

import com.adprod.inventar.models.UserRequest;
import com.adprod.inventar.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/user")
public class UserResource {

    private final UserService userService;

    // getRemoteAddr is the client's address: the proxies' X-Forwarded-For is applied
    // by server.forward-headers-strategy (application.properties).
    @PostMapping("/register")
    public ResponseEntity register(@RequestBody UserRequest userRequest, HttpServletRequest request){
        return userService.register(userRequest, request.getRemoteAddr());
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody UserRequest userRequest, HttpServletRequest request){
        return userService.login(userRequest, request.getRemoteAddr());
    }
}
