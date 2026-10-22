package com.adprod.inventar.models.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Money amounts are doubles that may be missing; balances keep two decimals. */
public final class Amounts {

    private Amounts() {
    }

    public static double orZero(Double value) {
        return value == null ? 0.0 : value;
    }

    /** Two decimals, half up; a missing amount is 0. */
    public static double round(Double value) {
        return BigDecimal.valueOf(orZero(value)).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
