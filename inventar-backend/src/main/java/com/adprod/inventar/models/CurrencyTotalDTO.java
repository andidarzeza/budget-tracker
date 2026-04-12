package com.adprod.inventar.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * One row from a $currency + sum aggregation (_id is the ISO currency code).
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CurrencyTotalDTO {

    @Field("_id")
    @JsonProperty("_id")
    private String currency;

    private Double total;
}
