package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.wrappers.SimplifiedAccountDTO;
import com.adprod.inventar.repositories.AccountRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;


@Service
@AllArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final SecurityContextService securityContextService;
    private final BalanceManager balanceManager;

    @Override
    public ResponseEntity findOne(String id) {
        return ResponseEntity.ok(
                accountRepository
                .findByUsernameAndAndId(securityContextService.username(), id)
        );
    }

    @Override
    public ResponseEntity findUserAccountsSimplified() {
        return ResponseEntity.ok(
                accountRepository
                        .findAllByUsername(securityContextService.username()).stream().map(account -> new SimplifiedAccountDTO(account.getId(), account.getTitle()))

        );
    }

    @Override
    public Account save(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public void removeFromBalance(String accountId, String currency, Double amount) {
        balanceManager.balance().remove(accountId, currency, amount);
    }

    @Override
    public void addToBalance(String accountId, String currency, Double amount) {
        balanceManager.balance().add(accountId, currency, amount);
    }

    @Override
    public void checkAccount(String account) {
        this.accountRepository
                .findByUsernameAndAndId(securityContextService.username(), account)
                .orElseThrow(() -> new NotFoundException("Account with number: " + account + " was not found"));
    }

    @Override
    public ResponseEntity setBalance(String accountId, Map<String, Double> balance) {
        Account account = accountRepository
                .findByUsernameAndAndId(securityContextService.username(), accountId)
                .orElseThrow(() -> new NotFoundException("Account " + accountId + " not found."));
        // Drop null/zero entries so the balance map only carries currencies with a real value;
        // preserves insertion order via LinkedHashMap so the dashboard stays stable across saves.
        Map<String, Double> cleaned = new LinkedHashMap<>();
        if (Objects.nonNull(balance)) {
            balance.forEach((currency, amount) -> {
                if (currency == null || currency.isBlank()) return;
                if (amount == null || amount == 0.0) return;
                cleaned.put(currency, amount);
            });
        }
        account.setBalance(cleaned);
        return ResponseEntity.ok(accountRepository.save(account));
    }
}
