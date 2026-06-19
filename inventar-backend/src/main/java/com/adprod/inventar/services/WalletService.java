package com.adprod.inventar.services;

import com.adprod.inventar.models.Wallet;
import org.springframework.http.ResponseEntity;

public interface WalletService {
    /** All wallets (money sources) for the given workspace, owned by the current user. */
    ResponseEntity<?> findAll(String account);
    ResponseEntity<?> save(Wallet wallet);
    ResponseEntity<?> update(String id, Wallet wallet);
    ResponseEntity<?> delete(String id);

    /** Resolve a wallet owned by the current user, or fail. Used by expense/income/project flows. */
    Wallet getOwned(String walletId);
    /** Add {@code amount} to the wallet's balance (income, refunds). */
    void credit(String walletId, Double amount);
    /** Subtract {@code amount} from the wallet's balance (expense, contributions). */
    void debit(String walletId, Double amount);
}
