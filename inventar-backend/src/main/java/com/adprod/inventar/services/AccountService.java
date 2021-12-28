package com.adprod.inventar.services;

import com.adprod.inventar.models.Account;
import org.springframework.http.ResponseEntity;

public interface AccountService {
    ResponseEntity find(String username);
    Account save(Account account);
    boolean removeFromBalance(Double amount, String username);
    boolean addToBalance(Double amount, String username);
}
