package com.adprod.inventar.migrations;

import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.models.enums.WalletType;
import com.adprod.inventar.repositories.WalletRepository;
import lombok.AllArgsConstructor;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * One-time, idempotent migration from the old per-currency balance map (stored on each
 * {@code account} document) to {@link Wallet} money sources.
 *
 * <p>For every account that has no wallets yet: each currency it touches — whether it has a
 * stored balance or only appears on past transactions — becomes a {@code CASH} wallet seeded
 * with the old balance (0 when there was none). Existing expenses, incomes, and contributions
 * are then backfilled with the matching {@code walletId} so edits/deletes refund the right
 * source. Re-running does nothing once wallets exist for an account.
 */
@Component
@AllArgsConstructor
public class WalletMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(WalletMigrationRunner.class);

    private static final String ACCOUNTS = "account";
    private static final String[] TXN_COLLECTIONS = {"spending", "incomes", "contributions"};

    private final MongoTemplate mongoTemplate;
    private final WalletRepository walletRepository;

    @Override
    public void run(ApplicationArguments args) {
        int accountsMigrated = 0;
        int walletsCreated = 0;
        for (Document accDoc : mongoTemplate.getCollection(ACCOUNTS).find()) {
            String accountId = String.valueOf(accDoc.get("_id"));
            String username = accDoc.getString("username");
            if (accountId == null || walletRepository.existsByAccount(accountId)) {
                continue; // already migrated (or nothing to key off)
            }

            Map<String, Double> balances = extractBalances(accDoc.get("balance"));
            Set<String> currencies = new LinkedHashSet<>(balances.keySet());
            currencies.addAll(currenciesFromTransactions(accountId));
            currencies.removeIf(c -> c == null || c.isBlank());
            if (currencies.isEmpty()) {
                continue;
            }

            Map<String, String> walletIdByCurrency = new HashMap<>();
            for (String currency : currencies) {
                Wallet wallet = new Wallet();
                wallet.setName("Cash");
                wallet.setType(WalletType.CASH.name());
                wallet.setCurrency(currency);
                wallet.setBalance(round(balances.getOrDefault(currency, 0.0)));
                wallet.setIcon("payments");
                wallet.setUser(username);
                wallet.setAccount(accountId);
                wallet = walletRepository.save(wallet);
                walletIdByCurrency.put(currency, wallet.getId());
                walletsCreated++;
            }

            backfillTransactions(accountId, walletIdByCurrency);
            accountsMigrated++;
        }
        if (accountsMigrated > 0) {
            log.info("Wallet migration: created {} wallet(s) across {} account(s).", walletsCreated, accountsMigrated);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractBalances(Object balanceField) {
        Map<String, Double> result = new LinkedHashMap<>();
        if (!(balanceField instanceof Map)) {
            return result;
        }
        ((Map<String, Object>) balanceField).forEach((currency, amount) -> {
            if (amount instanceof Number) {
                result.put(currency, ((Number) amount).doubleValue());
            }
        });
        return result;
    }

    private Set<String> currenciesFromTransactions(String accountId) {
        Set<String> currencies = new LinkedHashSet<>();
        Query query = Query.query(Criteria.where("account").is(accountId));
        for (String collection : TXN_COLLECTIONS) {
            currencies.addAll(mongoTemplate.findDistinct(query, "currency", collection, String.class));
        }
        return currencies;
    }

    private void backfillTransactions(String accountId, Map<String, String> walletIdByCurrency) {
        walletIdByCurrency.forEach((currency, walletId) -> {
            Query query = Query.query(Criteria.where("account").is(accountId)
                    .and("currency").is(currency)
                    .and("walletId").is(null));
            Update update = new Update().set("walletId", walletId);
            for (String collection : TXN_COLLECTIONS) {
                mongoTemplate.updateMulti(query, update, collection);
            }
        });
    }

    private static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
