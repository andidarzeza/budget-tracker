package com.adprod.inventar.resources;

import com.adprod.inventar.services.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountResource {
    private final AccountService accountService;

    public AccountResource(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/{username}")
    public ResponseEntity getAccount(@PathVariable String username){
        return accountService.find(username);
    }
}
