package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Account;
import com.adprod.inventar.repositories.AccountRepository;
import com.adprod.inventar.services.SecurityContextService;
import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
@Getter
public class BalanceManager {

    private final AccountRepository accountRepository;
    private final SecurityContextService securityContextService;

    private Account account;

    public BalanceManager(AccountRepository accountRepository, SecurityContextService securityContextService) {
        this.accountRepository = accountRepository;
        this.securityContextService = securityContextService;
    }

    protected BalanceManager balance() {
        this.account = accountRepository
                .findByUsername(securityContextService.username())
                .orElseThrow(
                        () -> new NotFoundException("An error occurred, account was not found!")
                );
        return this;
    }

    protected void add(Double amount) {
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    protected void remove(Double amount) {
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);
    }
}
