package com.adprod.inventar.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A money source: a single-currency bank account or cash holding inside a workspace
 * ({@code account}). Expenses debit it, incomes credit it, and the dashboard shows its
 * current {@code balance}. Type is stored as a string ({@link com.adprod.inventar.models.enums.WalletType}
 * name) to match the {@code Category.categoryType} convention.
 */
@Document(collection = "wallets")
@NoArgsConstructor
@Getter
@Setter
public class Wallet {

    @Id
    private String id;
    private String name;
    private String type;
    private String currency;
    private Double balance = 0.0;
    private String icon;
    private boolean archived;
    private String user;
    private String account;
    private LocalDateTime createdTime = LocalDateTime.now();
    private LocalDateTime lastModifiedDate = this.createdTime;
}
