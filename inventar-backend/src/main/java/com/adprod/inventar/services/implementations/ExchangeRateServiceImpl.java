package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.ExchangeRate;
import com.adprod.inventar.repositories.ExchangeRateRepository;
import com.adprod.inventar.services.WebPushService;
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
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    private final WebPushService webPushService;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

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
        ExchangeRate saved = exchangeRateRepository.save(rate);
        notifyIfRecordLow(saved);
        return saved;
    }

    /**
     * Push a notification when today's sell rate (what it costs to buy the currency) is lower
     * than on every earlier recorded day. Sent once per new low: the hourly re-check only
     * notifies again if the rate drops further the same day.
     */
    private void notifyIfRecordLow(ExchangeRate today) {
        Double sell = today.getSell();
        if (sell == null) return;
        Optional<ExchangeRate> previousLow = exchangeRateRepository.findAllByCurrencyOrderByDateAsc(today.getCurrency())
                .stream()
                .filter(r -> r.getSell() != null && r.getDate() != null && r.getDate().compareTo(today.getDate()) < 0)
                .min(Comparator.comparingDouble(ExchangeRate::getSell));
        if (previousLow.isEmpty() || sell >= previousLow.get().getSell()) return;
        if (today.getLowAlertSell() != null && sell >= today.getLowAlertSell()) return;

        ExchangeRate low = previousLow.get();
        String body = String.format("Sell rate %s ALL — the lowest Financa has recorded (previous low %s on %s).",
                format(sell), format(low.getSell()), shortDate(low.getDate()));
        try {
            int delivered = webPushService.sendToAll(Map.of(
                    "title", "1 " + today.getCurrency() + " is at a new low",
                    "body", body,
                    "url", "/exchange",
                    "tag", "rate-low-" + today.getCurrency()));
            log.info("{} at a new low ({}); notified {} device(s).", today.getCurrency(), sell, delivered);
        } catch (Exception e) {
            log.warn("Could not send the {} low-rate notification: {}", today.getCurrency(), e.getMessage());
        }
        today.setLowAlertSell(sell);
        exchangeRateRepository.save(today);
    }

    /** Rates as the exchange shows them: at least one decimal (92.0, 91.85). */
    private static String format(double value) {
        return new DecimalFormat("0.0##", DecimalFormatSymbols.getInstance(Locale.ENGLISH)).format(value);
    }

    private static String shortDate(String isoDay) {
        try {
            return LocalDate.parse(isoDay).format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH));
        } catch (Exception e) {
            return isoDay;
        }
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
