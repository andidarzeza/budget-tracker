package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** One expense or income matched by the app-wide search. */
@Getter
@AllArgsConstructor
public class SearchHitDTO {
    private String id;
    /** "EXPENSE" or "INCOME". */
    private String type;
    private String description;
    private String categoryId;
    private String category;
    private String icon;
    private Double amount;
    private String currency;
    /** Creation time, epoch millis. */
    private Long date;
}
