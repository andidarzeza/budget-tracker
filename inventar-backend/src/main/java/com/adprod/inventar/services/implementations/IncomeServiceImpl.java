package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;

import static com.adprod.inventar.models.enums.EntityAction.*;
import static com.adprod.inventar.models.enums.EntityType.INCOME;
import com.adprod.inventar.models.utils.Changes;
import com.adprod.inventar.models.wrappers.IncomeDTO;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.IncomeService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WalletService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final WalletService walletService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {

        String description = params.get("description");
        Double income = Double.parseDouble(Objects.nonNull(params.get("income")) ? params.get("income") : "-1");
        String category = params.get("category");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QIncome.income.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QIncome.income.account.eq(params.get("account")));
        if(Objects.nonNull(description)) {
            booleanBuilder = booleanBuilder.and(QIncome.income.description.containsIgnoreCase(description));
        }
        if(income > 0) {
            booleanBuilder = booleanBuilder.and(QIncome.income.incoming.eq(income));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QIncome.income.categoryID.eq(category));
        }

        Page<Income> page = incomeRepository.findAll(booleanBuilder, pageable);
        ResponseWrapper<IncomeDTO> incomeWrapper = new ResponseWrapper();
        List<Income> content = page.getContent();
        List<IncomeDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<Category> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                Category sc = data.get();
                response.add(new IncomeDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription(), item.getCurrency()));
            } else {
                response.add(new IncomeDTO(item.getId(), "No Category Found", "0", item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription(), item.getCurrency()));
            }
        });
        incomeWrapper.setData(response);
        incomeWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(incomeWrapper);
    }

    @Override
    public ResponseEntity save(Income income) {
        this.accountService.checkAccount(income.getAccount());
        income.setId(null);
        income.setUser(securityContextService.username());
        checkCategory(income);
        Wallet wallet = walletService.getOwned(income.getWalletId(), income.getAccount());
        income.setCurrency(wallet.getCurrency());
        walletService.credit(wallet.getId(), income.getIncoming());
        incomeRepository.save(income);
        historyService.record(History.of(CREATE, INCOME, income.getAccount(), income.getId(), summary(income)));
        return ResponseEntity.ok(income);
    }

    @Override
    public Income findOne(String id) {
        // Someone else's income is "not found".
        return incomeRepository
                .findById(id)
                .filter(income -> Objects.equals(income.getUser(), securityContextService.username()))
                .orElseThrow(() -> new NotFoundException("No Income Found with id: " + id));
    }

    @Override
    public ResponseEntity delete(String id) {
        Income income = findOne(id);
        String summary = summary(income);
        // Reverse the deposit: pull the amount back out of the source it landed in.
        reverse(income.getWalletId(), income.getIncoming());
        incomeRepository.delete(income);
        historyService.record(History.of(DELETE, INCOME, income.getAccount(), id, summary).withSnapshot(income));
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Income income) {
        accountService.checkAccount(income.getAccount());
        income.setUser(securityContextService.username());
        Income incomeDB = findOne(id);
        checkCategory(income);
        // Reverse the old deposit, then re-deposit into the (possibly new) source.
        reverse(incomeDB.getWalletId(), incomeDB.getIncoming());
        Wallet wallet = walletService.getOwned(income.getWalletId(), income.getAccount());
        income.setCurrency(wallet.getCurrency());
        walletService.credit(wallet.getId(), income.getIncoming());
        income.setId(id);
        // The edit form sends the (possibly changed) date; keep the old one only if it's missing.
        if (Objects.isNull(income.getCreatedTime())) {
            income.setCreatedTime(incomeDB.getCreatedTime());
        }
        income.setLastModifiedDate(new Date());
        incomeRepository.save(income);
        historyService.record(History.of(UPDATE, INCOME, income.getAccount(), id, summary(income))
                .withChanges(new Changes()
                        .add("Amount", money(incomeDB), money(income))
                        .add("Category", historyService.categoryName(incomeDB.getCategoryID()),
                                historyService.categoryName(income.getCategoryID()))
                        .add("Received into", historyService.sourceName(incomeDB.getWalletId()),
                                historyService.sourceName(income.getWalletId()))
                        .add("Date", incomeDB.getCreatedTime(), income.getCreatedTime())
                        .add("Name", incomeDB.getName(), income.getName())
                        .add("Description", incomeDB.getDescription(), income.getDescription())
                        .list()));
        return ResponseEntity.ok(income);

    }

    /** "Salary · 1200.00 EUR into BKT · October" */
    private String summary(Income income) {
        String into = historyService.sourceName(income.getWalletId());
        return Changes.summary(
                historyService.categoryName(income.getCategoryID()),
                money(income) + (into == null ? "" : " into " + into),
                income.getDescription());
    }

    private static String money(Income income) {
        return Changes.money(income.getIncoming(), income.getCurrency());
    }

    /** The income's category must be one of the user's, in the same account. */
    private void checkCategory(Income income) {
        if (income.getCategoryID() == null) return;
        categoryRepository.findById(income.getCategoryID())
                .filter(c -> Objects.equals(c.getUser(), income.getUser())
                        && Objects.equals(c.getAccount(), income.getAccount()))
                .orElseThrow(() -> new NotFoundException("Category " + income.getCategoryID() + " not found."));
    }

    /** Remove an amount from a source. No-op for legacy records without a source. */
    private void reverse(String walletId, Double amount) {
        if (Objects.nonNull(walletId)) {
            walletService.debit(walletId, amount);
        }
    }
}
