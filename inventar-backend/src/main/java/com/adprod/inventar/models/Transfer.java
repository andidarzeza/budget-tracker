package com.adprod.inventar.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A movement of money between two {@link Wallet}s in the same workspace — e.g. withdrawing
 * cash from a bank account at an ATM. It is neither income nor expense, so it never shows in
 * those totals; it only shifts balances. When currencies differ, {@code amountFrom} leaves the
 * source and {@code amountTo} lands in the destination (the implied exchange rate).
 */
@Document(collection = "transfers")
@NoArgsConstructor
@Getter
@Setter
public class Transfer {

    @Id
    private String id;
    private LocalDateTime createdTime = LocalDateTime.now();
    private String fromWalletId;
    private String toWalletId;
    private Double amountFrom;
    private Double amountTo;
    private String fromCurrency;
    private String toCurrency;
    private String description;
    private String account;
    private String user;
}
