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
    public void removeFromBalance(String currency, Double amount) {
        balanceManager.balance().remove(currency, amount);
    }

    @Override
    public void addToBalance(String currency, Double amount) {
        balanceManager.balance().add(currency, amount);
    }
}
