package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.models.enums.WalletType;
import com.adprod.inventar.repositories.WalletRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WalletService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final AccountService accountService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity<?> findAll(String account) {
        accountService.checkAccount(account);
        List<Wallet> wallets = walletRepository.findAllByUserAndAccount(securityContextService.username(), account);
        // Active first, then bank before cash, then by name — keeps the dashboard order stable.
        wallets.sort(Comparator
                .comparing(Wallet::isArchived)
                .thenComparing(w -> Objects.toString(w.getType(), ""))
                .thenComparing(w -> Objects.toString(w.getName(), "")));
        return ResponseEntity.ok(wallets);
    }

    @Override
    public ResponseEntity<?> save(Wallet wallet) {
        accountService.checkAccount(wallet.getAccount());
        validate(wallet);
        wallet.setId(null);
        wallet.setUser(securityContextService.username());
        wallet.setBalance(round(wallet.getBalance()));
        wallet.setCreatedTime(LocalDateTime.now());
        wallet.setLastModifiedDate(wallet.getCreatedTime());
        return ResponseEntity.ok(walletRepository.save(wallet));
    }

    @Override
    public ResponseEntity<?> update(String id, Wallet wallet) {
        Wallet existing = getOwned(id);
        validate(wallet);
        existing.setName(wallet.getName());
        existing.setType(wallet.getType());
        existing.setCurrency(wallet.getCurrency());
        existing.setIcon(wallet.getIcon());
        existing.setArchived(wallet.isArchived());
        // Editing the balance here is the explicit "set/correct balance" action (replaces the old
        // per-currency edit-balance dialog); transactions adjust it automatically elsewhere.
        existing.setBalance(round(wallet.getBalance()));
        existing.setLastModifiedDate(LocalDateTime.now());
        return ResponseEntity.ok(walletRepository.save(existing));
    }

    @Override
    public ResponseEntity<?> delete(String id) {
        Wallet wallet = getOwned(id);
        walletRepository.delete(wallet);
        return ResponseEntity.ok(new ResponseMessage("Wallet " + id + " was deleted."));
    }

    @Override
    public Wallet getOwned(String walletId) {
        if (walletId == null) {
            throw new NotFoundException("A money source is required.");
        }
        return walletRepository.findByIdAndUser(walletId, securityContextService.username())
                .orElseThrow(() -> new NotFoundException("Wallet " + walletId + " not found."));
    }

    @Override
    public void credit(String walletId, Double amount) {
        Wallet wallet = getOwned(walletId);
        wallet.setBalance(round(orZero(wallet.getBalance()) + orZero(amount)));
        wallet.setLastModifiedDate(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    @Override
    public void debit(String walletId, Double amount) {
        Wallet wallet = getOwned(walletId);
        wallet.setBalance(round(orZero(wallet.getBalance()) - orZero(amount)));
        wallet.setLastModifiedDate(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    private void validate(Wallet wallet) {
        if (wallet.getName() == null || wallet.getName().isBlank()) {
            throw new IllegalArgumentException("Wallet name is required.");
        }
        if (wallet.getCurrency() == null || wallet.getCurrency().isBlank()) {
            throw new IllegalArgumentException("Wallet currency is required.");
        }
        // Accept only known types; defaults to CASH name if something odd slips through.
        try {
            WalletType.valueOf(Objects.toString(wallet.getType(), "").toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Wallet type must be BANK or CASH.");
        }
        wallet.setType(wallet.getType().toUpperCase());
    }

    private static double orZero(Double value) {
        return value == null ? 0.0 : value;
    }

    private static double round(Double value) {
        return BigDecimal.valueOf(orZero(value)).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
