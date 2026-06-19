package com.adprod.inventar.models.enums;

/**
 * Where money actually sits. A {@code BANK} wallet is a bank account; a {@code CASH}
 * wallet is physical cash. Each wallet holds a single currency, so a user typically has
 * several (e.g. "BKT · EUR", "Cash · EUR", "Cash · KRW").
 */
public enum WalletType {
    BANK, CASH
}
