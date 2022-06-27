package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Account;
import com.adprod.inventar.repositories.AccountRepository;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
@Getter
@AllArgsConstructor
public class BalanceManager {

    private final AccountRepository accountRepository;
    private final SecurityContextService securityContextService;

    protected BalanceManager balance() {
        return this;
    }

    private Account getAccount() {
        return accountRepository
                .findByUsername(securityContextService.username())
                .orElseThrow(
                        () -> new NotFoundException("An error occurred, account was not found!")
                );
    }

    protected void add(Double amount) {
        Account account = getAccount();
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    protected void remove(Double amount) {
        Account account = getAccount();
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);
    }
}
