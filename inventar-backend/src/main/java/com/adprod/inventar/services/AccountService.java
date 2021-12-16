package com.adprod.inventar.services;

import com.adprod.inventar.models.Account;
import org.springframework.http.ResponseEntity;

public interface AccountService {
    ResponseEntity getAccount(String id);
    ResponseEntity createAccount(Account account);
    boolean removeFromBalance(Double amount);
    boolean addToBalance(Double amount);
}
