package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * A workspace/ledger owned by a user (e.g. "Personal", "Business"). Money now lives on
 * {@link Wallet}s scoped to an account, not on the account itself.
 */
@Document
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Account {
    @Id
    private String id;
    private String title;
    private String username;
}
