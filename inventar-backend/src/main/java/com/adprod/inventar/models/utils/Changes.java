package com.adprod.inventar.models.utils;

import com.adprod.inventar.models.History;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Collects the fields that differ between the old and new version of a record, as the
 * History page shows them: "Amount 20.00 → 23.50". Equal values are skipped.
 */
public class Changes {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final List<History.Change> list = new ArrayList<>();

    public Changes add(String field, Object from, Object to) {
        String before = format(from);
        String after = format(to);
        if (!Objects.equals(before, after)) {
            list.add(new History.Change(field, before, after));
        }
        return this;
    }

    public List<History.Change> list() {
        return list;
    }

    /** Join the non-blank parts with " · ": "Groceries · 23.50 EUR from BKT · Lidl". */
    public static String summary(String... parts) {
        StringBuilder out = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) continue;
            if (out.length() > 0) out.append(" · ");
            out.append(part.trim());
        }
        return out.toString();
    }

    /** "EXPENSE" → "Expense"; null stays null. */
    public static String label(String constant) {
        return constant == null || constant.isBlank() ? null
                : constant.charAt(0) + constant.substring(1).toLowerCase(Locale.ROOT);
    }

    /** "23.50 EUR" (just the number when there is no currency). */
    public static String money(Double amount, String currency) {
        String number = amount == null ? "0.00" : String.format(Locale.ROOT, "%.2f", amount);
        return currency == null || currency.isBlank() ? number : number + " " + currency;
    }

    private static String format(Object value) {
        if (value == null) return null;
        if (value instanceof Double) return String.format(Locale.ROOT, "%.2f", (Double) value);
        if (value instanceof LocalDateTime) return ((LocalDateTime) value).format(DATE_TIME);
        if (value instanceof Date) return new SimpleDateFormat("yyyy-MM-dd HH:mm").format((Date) value);
        if (value instanceof Boolean) return (Boolean) value ? "Yes" : "No";
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }
}
