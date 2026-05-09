package com.adprod.inventar.models.enums;

public enum RangeType {
    DAY,
    WEEK,
    MONTH,
    YEAR,
    MAX,
    /** Arbitrary user-selected window. Frontend caps the gap at 31 days. */
    CUSTOM
}
