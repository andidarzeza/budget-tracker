package com.adprod.inventar.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * One rate snapshot per currency per day (Europe/Tirane), scraped from Iliria98.
 * {@code sell} is the rate the exchange sells the currency for (e.g. 1 EUR = 92.1 ALL),
 * {@code buy} the rate it buys it at. Re-fetches during the same day overwrite the row,
 * so it ends up holding that day's last published value.
 */
@Document("exchange_rates")
@CompoundIndex(name = "currency_date", def = "{'currency': 1, 'date': 1}", unique = true)
@Getter
@Setter
public class ExchangeRate {

    @Id
    private String id;
    private String currency;
    /** ISO day, yyyy-MM-dd. */
    private String date;
    private Double buy;
    private Double sell;
    private String source;
    private Date fetchedAt;

}
