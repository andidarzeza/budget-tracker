package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Account;
import com.adprod.inventar.repositories.AccountRepository;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@Getter
@AllArgsConstructor
public class BalanceManager {

    private final AccountRepository accountRepository;
    private final SecurityContextService securityContextService;

    protected BalanceManager balance() {
        return this;
    }

    private Account getAccount(String account) {
        return accountRepository
                .findByUsernameAndAndId(securityContextService.username(), account)
                .orElseThrow(
                        () -> new NotFoundException("An error occurred, account was not found!")
                );
    }

    protected void add(String accountId, String currency, Double amount) {
        Account account = getAccount(accountId);
        var oldBalance = Optional.ofNullable(account.getBalance().get(currency)).orElse(0.0);
        account.getBalance().put(currency, oldBalance + amount);
        if((oldBalance + amount) == 0) {
            account.getBalance().remove(currency);
        }
        accountRepository.save(account);
    }

    protected void remove(String accountId, String currency, Double amount) {
        Account account = getAccount(accountId);
        var oldBalance = Optional.ofNullable(account.getBalance().get(currency)).orElse(0.0);
        account.getBalance().put(currency, oldBalance - amount);
        if((oldBalance - amount) == 0) {
            account.getBalance().remove(currency);
        }
        accountRepository.save(account);
    }
}
