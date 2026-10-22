package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.History;
import com.adprod.inventar.models.Transfer;
import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.utils.Changes;
import static com.adprod.inventar.models.utils.Amounts.orZero;
import com.adprod.inventar.repositories.TransferRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
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
    private final HistoryService historyService;

    @Override
    public ResponseEntity<?> save(Transfer transfer) {
        accountService.checkAccount(transfer.getAccount());
        if (Objects.equals(transfer.getFromWalletId(), transfer.getToWalletId())) {
            throw new IllegalArgumentException("Source and destination must be different.");
        }
        Wallet from = walletService.getOwned(transfer.getFromWalletId(), transfer.getAccount());
        Wallet to = walletService.getOwned(transfer.getToWalletId(), transfer.getAccount());

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

        transfer.setId(null);
        transfer.setUser(securityContextService.username());
        transfer.setFromCurrency(from.getCurrency());
        transfer.setToCurrency(to.getCurrency());
        transfer.setAmountFrom(amountFrom);
        transfer.setAmountTo(amountTo);
        transfer.setCreatedTime(LocalDateTime.now());

        walletService.debit(from.getId(), amountFrom);
        walletService.credit(to.getId(), amountTo);
        transferRepository.save(transfer);
        historyService.record(History.of(EntityAction.CREATE, EntityType.TRANSFER, transfer.getAccount(), transfer.getId(), summary(transfer)));
        return ResponseEntity.ok(transfer);
    }

    /** "100.00 EUR BKT → Cash" (with the received amount when the currencies differ). */
    private String summary(Transfer transfer) {
        String sent = Changes.money(transfer.getAmountFrom(), transfer.getFromCurrency());
        String received = Changes.money(transfer.getAmountTo(), transfer.getToCurrency());
        String route = Objects.toString(historyService.sourceName(transfer.getFromWalletId()), "?")
                + " → " + Objects.toString(historyService.sourceName(transfer.getToWalletId()), "?");
        return Changes.summary(sent.equals(received) ? sent : sent + " → " + received, route, transfer.getDescription());
    }

    private static boolean sameCurrency(Wallet a, Wallet b) {
        return Objects.equals(
                Objects.toString(a.getCurrency(), "").toUpperCase(),
                Objects.toString(b.getCurrency(), "").toUpperCase());
    }

}
