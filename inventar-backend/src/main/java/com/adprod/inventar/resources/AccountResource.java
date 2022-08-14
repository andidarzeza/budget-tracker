package com.adprod.inventar.resources;

import com.adprod.inventar.services.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/account")
public class AccountResource {

    private final AccountService accountService;

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return accountService.findOne(id);
    }

    @GetMapping("/simplified")
    public ResponseEntity findUserAccountsSimplified(){
        return accountService.findUserAccountsSimplified();
    }
}
