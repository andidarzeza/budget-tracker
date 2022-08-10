package com.adprod.inventar.services;

import com.adprod.inventar.models.Account;
import org.springframework.http.ResponseEntity;

public interface AccountService {
    ResponseEntity find();
    Account save(Account account);
    void removeFromBalance(String currency, Double amount);
    void addToBalance(String currency, Double amount);
}
