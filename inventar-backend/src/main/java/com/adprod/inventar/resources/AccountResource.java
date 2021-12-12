package com.adprod.inventar.resources;

import com.adprod.inventar.models.Account;
import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.utils.Comparator;
import com.adprod.inventar.models.utils.Subtractive;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.BookService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "http://localhost:4200")
public class AccountResource {
    private final AccountService accountService;
    public AccountResource(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/{id}")
    public ResponseEntity getAccount(@PathVariable String id){
        return accountService.getAccount(id);
    }

    @PostMapping
    public ResponseEntity createAccount(@RequestBody Account account){
        return accountService.createAccount(account);
    }
}
