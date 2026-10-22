package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Configuration {
    @Id
    private String id;
    private boolean darkMode;
    private String user;
    private String baseCurrency;
    /** Settings → default source for new expenses / incomes (wallet ids). */
    private String defaultExpenseWalletId;
    private String defaultIncomeWalletId;
}
