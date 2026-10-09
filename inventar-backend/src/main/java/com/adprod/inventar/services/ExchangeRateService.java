package com.adprod.inventar.services;

import com.adprod.inventar.models.ExchangeRate;
import org.springframework.http.ResponseEntity;

public interface ExchangeRateService {

    ResponseEntity latest(String currency);

    ResponseEntity history(String currency, String from, String to);

    /** Scrapes the current rate and stores it as today's value. */
    ExchangeRate refresh(String currency);

}
