package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.ExchangeRate;
import com.adprod.inventar.repositories.ExchangeRateRepository;
import com.adprod.inventar.services.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateServiceImpl.class);

    private static final String SOURCE = "https://iliria98.com/";
    private static final ZoneId TIRANA = ZoneId.of("Europe/Tirane");
    private static final String DEFAULT_CURRENCY = "EUR";

    private final ExchangeRateRepository exchangeRateRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Override
    public ResponseEntity latest(String currency) {
        return exchangeRateRepository.findFirstByCurrencyOrderByDateDesc(currency)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("No exchange rate stored for " + currency));
    }

    @Override
    public ResponseEntity history(String currency, String from, String to) {
        if (Objects.isNull(from) || Objects.isNull(to)) {
            return ResponseEntity.ok(exchangeRateRepository.findAllByCurrencyOrderByDateAsc(currency));
        }
        return ResponseEntity.ok(exchangeRateRepository.findInRange(currency, from, to, Sort.by("date")));
    }

    @Override
    public ExchangeRate refresh(String currency) {
        double[] rates = scrape(currency);
        String today = LocalDate.now(TIRANA).toString();
        ExchangeRate rate = exchangeRateRepository.findByCurrencyAndDate(currency, today).orElseGet(ExchangeRate::new);
        rate.setCurrency(currency);
        rate.setDate(today);
        rate.setBuy(rates[0]);
        rate.setSell(rates[1]);
        rate.setSource(SOURCE);
        rate.setFetchedAt(new Date());
        return exchangeRateRepository.save(rate);
    }

    /** Store a value as soon as the app is up, so today is never missing. */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        scheduledRefresh();
    }

    /** Re-check hourly; the day's row keeps the latest published value. */
    @Scheduled(cron = "0 5 * * * *", zone = "Europe/Tirane")
    public void scheduledRefresh() {
        try {
            ExchangeRate rate = refresh(DEFAULT_CURRENCY);
            log.info("Stored {} rate for {}: buy {} / sell {}", rate.getCurrency(), rate.getDate(), rate.getBuy(), rate.getSell());
        } catch (Exception e) {
            log.warn("Could not refresh {} exchange rate: {}", DEFAULT_CURRENCY, e.getMessage());
        }
    }

    /** Returns {buy, sell} for the currency row of Iliria98's rates table. */
    private double[] scrape(String currency) {
        String html;
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(SOURCE))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "Mozilla/5.0 (budget-tracker rate sync)")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IllegalStateException("Iliria98 responded " + response.statusCode());
            }
            html = response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while fetching rates", e);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Could not reach Iliria98: " + e.getMessage(), e);
        }
        // <b>EUR</b></span> <span><div class="arrow ..."></div> 91.4 </span> <span><div ...></div> 92.1 </span>
        Pattern pattern = Pattern.compile(
                "<b>" + Pattern.quote(currency) + "</b>\\s*</span>\\s*"
                        + "<span>\\s*(?:<div[^>]*>\\s*</div>)?\\s*([\\d.,]+)\\s*</span>\\s*"
                        + "<span>\\s*(?:<div[^>]*>\\s*</div>)?\\s*([\\d.,]+)\\s*</span>");
        Matcher matcher = pattern.matcher(html);
        if (!matcher.find()) {
            throw new IllegalStateException(currency + " row not found on Iliria98");
        }
        return new double[]{parse(matcher.group(1)), parse(matcher.group(2))};
    }

    private static double parse(String value) {
        return Double.parseDouble(value.replace(",", "."));
    }
}
