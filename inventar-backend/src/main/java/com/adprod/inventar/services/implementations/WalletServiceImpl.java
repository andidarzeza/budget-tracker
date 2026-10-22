package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Category;
import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.History;
import com.adprod.inventar.models.Income;
import com.adprod.inventar.models.QCategory;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.enums.WalletType;
import com.adprod.inventar.models.utils.Changes;
import static com.adprod.inventar.models.utils.Amounts.orZero;
import static com.adprod.inventar.models.utils.Amounts.round;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.repositories.WalletRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WalletService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class WalletServiceImpl implements WalletService {

    /** Category the automatic balance-correction entries are filed under. */
    static final String ADJUSTMENT_CATEGORY = "Balance adjustment";

    private final WalletRepository walletRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final SecurityContextService securityContextService;
    private final HistoryService historyService;

    @Override
    public ResponseEntity<?> findAll(String account) {
        accountService.checkAccount(account);
        List<Wallet> wallets = walletRepository.findAllByUserAndAccount(securityContextService.username(), account);
        // Active first, then bank before cash, then by name — keeps the dashboard order stable.
        wallets.sort(Comparator
                .comparing(Wallet::isArchived)
                .thenComparing(w -> Objects.toString(w.getType(), ""))
                .thenComparing(w -> Objects.toString(w.getName(), "")));
        return ResponseEntity.ok(wallets);
    }

    @Override
    public ResponseEntity<?> save(Wallet wallet) {
        accountService.checkAccount(wallet.getAccount());
        validate(wallet);
        wallet.setId(null);
        wallet.setUser(securityContextService.username());
        wallet.setBalance(round(wallet.getBalance()));
        wallet.setCreatedTime(LocalDateTime.now());
        wallet.setLastModifiedDate(wallet.getCreatedTime());
        Wallet saved = walletRepository.save(wallet);
        historyService.record(History.of(EntityAction.CREATE, EntityType.SOURCE, saved.getAccount(), saved.getId(), summary(saved)));
        return ResponseEntity.ok(saved);
    }

    @Override
    public ResponseEntity<?> update(String id, Wallet wallet) {
        Wallet existing = getOwned(id);
        validate(wallet);
        Changes changes = new Changes()
                .add("Name", existing.getName(), wallet.getName())
                .add("Type", existing.getType(), wallet.getType())
                .add("Currency", existing.getCurrency(), wallet.getCurrency())
                .add("Balance", existing.getBalance(), round(wallet.getBalance()))
                .add("Icon", existing.getIcon(), wallet.getIcon())
                .add("Archived", existing.isArchived(), wallet.isArchived());
        existing.setName(wallet.getName());
        existing.setType(wallet.getType());
        existing.setIcon(wallet.getIcon());
        existing.setArchived(wallet.isArchived());
        // Editing the balance here is the explicit "set/correct balance" action (replaces the old
        // per-currency edit-balance dialog); transactions adjust it automatically elsewhere.
        // The correction itself is recorded as an income (balance went up) or an expense (went
        // down), so savings and the statistics still add up. Not when the currency changed too:
        // the old and new amounts are then in different units.
        String oldCurrency = existing.getCurrency();
        double oldBalance = orZero(existing.getBalance());
        double newBalance = round(wallet.getBalance());
        existing.setCurrency(wallet.getCurrency());
        existing.setBalance(newBalance);
        existing.setLastModifiedDate(LocalDateTime.now());
        Wallet saved = walletRepository.save(existing);
        historyService.record(History.of(EntityAction.UPDATE, EntityType.SOURCE, saved.getAccount(), id, summary(saved))
                .withChanges(changes.list()));
        double difference = round(newBalance - oldBalance);
        if (difference != 0 && Objects.equals(oldCurrency, saved.getCurrency())) {
            recordAdjustment(saved, difference);
        }
        return ResponseEntity.ok(saved);
    }

    @Override
    public ResponseEntity<?> delete(String id) {
        Wallet wallet = getOwned(id);
        walletRepository.delete(wallet);
        historyService.record(History.of(EntityAction.DELETE, EntityType.SOURCE, wallet.getAccount(), id, summary(wallet))
                .withSnapshot(wallet));
        return ResponseEntity.ok(new ResponseMessage("Wallet " + id + " was deleted."));
    }

    @Override
    public Wallet getOwned(String walletId) {
        if (walletId == null) {
            throw new NotFoundException("A money source is required.");
        }
        return walletRepository.findByIdAndUser(walletId, securityContextService.username())
                .orElseThrow(() -> new NotFoundException("Wallet " + walletId + " not found."));
    }

    @Override
    public Wallet getOwned(String walletId, String account) {
        Wallet wallet = getOwned(walletId);
        if (!Objects.equals(wallet.getAccount(), account)) {
            throw new NotFoundException("Wallet " + walletId + " not found.");
        }
        return wallet;
    }

    @Override
    public void credit(String walletId, Double amount) {
        Wallet wallet = getOwned(walletId);
        wallet.setBalance(round(orZero(wallet.getBalance()) + orZero(amount)));
        wallet.setLastModifiedDate(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    @Override
    public void debit(String walletId, Double amount) {
        Wallet wallet = getOwned(walletId);
        wallet.setBalance(round(orZero(wallet.getBalance()) - orZero(amount)));
        wallet.setLastModifiedDate(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    /**
     * Write the balance correction as an income / expense on this wallet. The wallet balance is
     * already set, so these are saved straight to the repositories (the services would credit /
     * debit the wallet a second time).
     */
    private void recordAdjustment(Wallet wallet, double difference) {
        String description = ADJUSTMENT_CATEGORY + " · " + wallet.getName();
        if (difference > 0) {
            Income income = new Income();
            income.setIncoming(difference);
            income.setDescription(description);
            income.setCategoryID(adjustmentCategory(wallet, "INCOME").getId());
            income.setCurrency(wallet.getCurrency());
            income.setAccount(wallet.getAccount());
            income.setWalletId(wallet.getId());
            income.setUser(wallet.getUser());
            income.setCreatedTime(new Date());
            income.setLastModifiedDate(income.getCreatedTime());
            incomeRepository.save(income);
            historyService.record(History.of(EntityAction.CREATE, EntityType.INCOME, wallet.getAccount(), income.getId(),
                            Changes.summary(ADJUSTMENT_CATEGORY, Changes.money(difference, wallet.getCurrency()) + " into " + wallet.getName()))
                    .causedBy("Balance of " + wallet.getName() + " edited"));
        } else {
            Expense expense = new Expense();
            expense.setMoneySpent(-difference);
            expense.setDescription(description);
            expense.setCategoryID(adjustmentCategory(wallet, "EXPENSE").getId());
            expense.setCurrency(wallet.getCurrency());
            expense.setAccount(wallet.getAccount());
            expense.setWalletId(wallet.getId());
            expense.setUser(wallet.getUser());
            expenseRepository.save(expense);
            historyService.record(History.of(EntityAction.CREATE, EntityType.EXPENSE, wallet.getAccount(), expense.getId(),
                            Changes.summary(ADJUSTMENT_CATEGORY, Changes.money(-difference, wallet.getCurrency()) + " from " + wallet.getName()))
                    .causedBy("Balance of " + wallet.getName() + " edited"));
        }
    }

    /** "BKT · Bank · 120.00 EUR" */
    private static String summary(Wallet wallet) {
        return Changes.summary(wallet.getName(), Changes.label(wallet.getType()), Changes.money(wallet.getBalance(), wallet.getCurrency()),
                wallet.isArchived() ? "archived" : null);
    }

    /** The user's "Balance adjustment" category of this type, created on first use. */
    private Category adjustmentCategory(Wallet wallet, String type) {
        QCategory q = QCategory.category1;
        return categoryRepository.findOne(q.user.eq(wallet.getUser())
                        .and(q.account.eq(wallet.getAccount()))
                        .and(q.categoryType.eq(type))
                        .and(q.category.eq(ADJUSTMENT_CATEGORY)))
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setCategory(ADJUSTMENT_CATEGORY);
                    category.setCategoryType(type);
                    category.setIcon("tune");
                    category.setDescription("Corrections made when editing a balance by hand.");
                    category.setUser(wallet.getUser());
                    category.setAccount(wallet.getAccount());
                    return categoryRepository.save(category);
                });
    }

    private void validate(Wallet wallet) {
        if (wallet.getName() == null || wallet.getName().isBlank()) {
            throw new IllegalArgumentException("Wallet name is required.");
        }
        if (wallet.getCurrency() == null || wallet.getCurrency().isBlank()) {
            throw new IllegalArgumentException("Wallet currency is required.");
        }
        // Accept only known types; defaults to CASH name if something odd slips through.
        try {
            WalletType.valueOf(Objects.toString(wallet.getType(), "").toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Wallet type must be BANK or CASH.");
        }
        wallet.setType(wallet.getType().toUpperCase());
    }

}
