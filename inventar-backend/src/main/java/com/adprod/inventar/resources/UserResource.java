package com.adprod.inventar.resources;

import com.adprod.inventar.models.UserRequest;
import com.adprod.inventar.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserResource {

    private final UserService userService;

    public UserResource(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody UserRequest userRequest){
        return userService.register(userRequest);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody UserRequest userRequest){
        return userService.login(userRequest);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Object> getAllUsers(){
        return userService.getAllUsers();
    }

    @DeleteMapping("/admin/delete/{userID:.+}")
    public ResponseEntity<Object> deleteUser(@PathVariable String userID){
        return userService.deleteUser(userID);
    }

    @PutMapping("/admin/update/{userID:.+}")
    public ResponseEntity<Object> updateUser(@RequestParam("newUsername") String newUsername, @PathVariable String userID){
        return userService.updateUser(newUsername, userID);
    }
}
