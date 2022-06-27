package com.adprod.inventar.resources;

import com.adprod.inventar.models.UserRequest;
import com.adprod.inventar.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@AllArgsConstructor
@RequestMapping("/api/user")
public class UserResource {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody UserRequest userRequest){
        return userService.register(userRequest);
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody UserRequest userRequest){
        return userService.login(userRequest);
    }

    @GetMapping("/admin/all")
    public ResponseEntity findAll(){
        return userService.findAll();
    }

    @DeleteMapping("/admin/delete/{userID:.+}")
    public ResponseEntity delete(@PathVariable String userID){
        return userService.delete(userID);
    }

    @PutMapping("/admin/update/{userID:.+}")
    public ResponseEntity update(@RequestParam("newUsername") String newUsername, @PathVariable String userID){
        return userService.update(newUsername, userID);
    }
}
