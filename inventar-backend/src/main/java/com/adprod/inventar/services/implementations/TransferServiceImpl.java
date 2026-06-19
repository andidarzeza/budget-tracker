package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.Transfer;
import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.repositories.TransferRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.TransferService;
import com.adprod.inventar.services.WalletService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@AllArgsConstructor
public class TransferServiceImpl implements TransferService {

    private final TransferRepository transferRepository;
    private final WalletService walletService;
    private final AccountService accountService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity<?> save(Transfer transfer) {
        accountService.checkAccount(transfer.getAccount());
        if (Objects.equals(transfer.getFromWalletId(), transfer.getToWalletId())) {
            throw new IllegalArgumentException("Source and destination must be different.");
        }
        Wallet from = resolveWallet(transfer.getFromWalletId(), transfer.getAccount());
        Wallet to = resolveWallet(transfer.getToWalletId(), transfer.getAccount());

        double amountFrom = orZero(transfer.getAmountFrom());
        if (amountFrom <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero.");
        }
        // Same currency: the destination receives exactly what left the source. Different
        // currencies: the caller supplies the converted amount that lands in the destination.
        double amountTo = sameCurrency(from, to)
                ? amountFrom
                : orZero(transfer.getAmountTo());
        if (amountTo <= 0) {
            throw new IllegalArgumentException("Amount received must be greater than zero.");
        }

        transfer.setUser(securityContextService.username());
        transfer.setFromCurrency(from.getCurrency());
        transfer.setToCurrency(to.getCurrency());
        transfer.setAmountFrom(amountFrom);
        transfer.setAmountTo(amountTo);
        transfer.setCreatedTime(LocalDateTime.now());

        walletService.debit(from.getId(), amountFrom);
        walletService.credit(to.getId(), amountTo);
        transferRepository.save(transfer);
        return ResponseEntity.ok(transfer);
    }

    @Override
    public ResponseEntity<?> findAll(String account) {
        accountService.checkAccount(account);
        return ResponseEntity.ok(
                transferRepository.findAllByUserAndAccountOrderByCreatedTimeDesc(
                        securityContextService.username(), account));
    }

    @Override
    public ResponseEntity<?> delete(String id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transfer " + id + " not found."));
        if (!Objects.equals(transfer.getUser(), securityContextService.username())) {
            throw new NotFoundException("Transfer " + id + " not found.");
        }
        // Undo the movement: put the money back where it came from.
        walletService.credit(transfer.getFromWalletId(), transfer.getAmountFrom());
        walletService.debit(transfer.getToWalletId(), transfer.getAmountTo());
        transferRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseMessage("Transfer " + id + " was reversed."));
    }

    private Wallet resolveWallet(String walletId, String account) {
        Wallet wallet = walletService.getOwned(walletId);
        if (!Objects.equals(wallet.getAccount(), account)) {
            throw new NotFoundException("Wallet " + walletId + " not found.");
        }
        return wallet;
    }

    private static boolean sameCurrency(Wallet a, Wallet b) {
        return Objects.equals(
                Objects.toString(a.getCurrency(), "").toUpperCase(),
                Objects.toString(b.getCurrency(), "").toUpperCase());
    }

    private static double orZero(Double value) {
        return value == null ? 0.0 : value;
    }
}
