package com.adprod.inventar.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class IncomeInfoDTO {
    @JsonProperty("_id")
    private String _id;
    private Double total;
    /** ISO currency code; rows are split per currency since totals across currencies are not additive. */
    private String currency;
}
