package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.AccountRepository;
import com.adprod.inventar.services.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public ResponseEntity getAccount(String id) {
        Optional<Account> accountOptional = accountRepository.findById(id);
        if(accountOptional.isPresent()) {
            return ResponseEntity.ok(accountOptional.get());
        }
        return new ResponseEntity(new ResponseMessage("No Account found for given id"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity createAccount(Account account) {
        accountRepository.save(account);
        return ResponseEntity.ok(account);
    }

    @Override
    public boolean removeFromBalance(Double amount) {
        Optional<Account> accountOptional = accountRepository.findById("61b614acf563e554ee4ebb9c");
        if(accountOptional.isPresent()) {
            Account account = accountOptional.get();
            account.setBalance(account.getBalance() - amount);
            accountRepository.save(account);
            return true;
        }
        return false;
    }

    @Override
    public boolean addToBalance(Double amount) {
        Optional<Account> accountOptional = accountRepository.findById("61b614acf563e554ee4ebb9c");
        if(accountOptional.isPresent()) {
            Account account = accountOptional.get();
            account.setBalance(account.getBalance() + amount);
            accountRepository.save(account);
            return true;
        }
        return false;
    }
}
