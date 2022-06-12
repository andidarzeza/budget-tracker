package com.adprod.inventar.resources;

import com.adprod.inventar.services.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/account")
public class AccountResource {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity getAccount(){
        return accountService.find();
    }
}
