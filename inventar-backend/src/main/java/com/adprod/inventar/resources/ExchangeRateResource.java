package com.adprod.inventar.resources;

import com.adprod.inventar.services.ExchangeRateService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/exchange-rates")
public class ExchangeRateResource {

    private final ExchangeRateService exchangeRateService;

    @GetMapping("/latest")
    public ResponseEntity latest(@RequestParam(defaultValue = "EUR") String currency) {
        return exchangeRateService.latest(currency);
    }

    /** Daily values, optionally limited to [from, to] (yyyy-MM-dd, inclusive). */
    @GetMapping
    public ResponseEntity history(@RequestParam(defaultValue = "EUR") String currency,
                                  @RequestParam(required = false) String from,
                                  @RequestParam(required = false) String to) {
        return exchangeRateService.history(currency, from, to);
    }

    /** Fetch the live rate from Iliria98 now and store it as today's value. */
    @PostMapping("/refresh")
    public ResponseEntity refresh(@RequestParam(defaultValue = "EUR") String currency) {
        return ResponseEntity.ok(exchangeRateService.refresh(currency));
    }
}
