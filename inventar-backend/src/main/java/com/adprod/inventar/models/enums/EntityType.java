package com.adprod.inventar.models.enums;

/** DASHBOARD and USER are no longer recorded but may be in old history entries. */
public enum EntityType {
    INCOME,
    EXPENSE,
    CATEGORY,
    DASHBOARD,
    USER,
    /** A money source (bank/cash) — `Wallet` in the code. */
    SOURCE,
    TRANSFER,
    PROJECT,
    CONTRIBUTION
}
