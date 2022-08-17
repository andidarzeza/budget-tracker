package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.EXPENSE;
import com.adprod.inventar.models.wrappers.ExpenseDTO;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        this.accountService.checkAccount(params.get("account"));
        String description = params.get("description");
        Double expense = Double.parseDouble(Objects.nonNull(params.get("expense")) ? params.get("expense") : "-1");
        String category = params.get("category");
        BooleanBuilder booleanBuilder = new BooleanBuilder()
                .and(QExpense.expense.user.eq(securityContextService.username()))
                .and(QExpense.expense.account.eq(params.get("account")))
                .and(QExpense.expense.description.containsIgnoreCase(Objects.toString(description, "")));
        if(expense > 0) {
            booleanBuilder = booleanBuilder.and(QExpense.expense.moneySpent.eq(expense));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QExpense.expense.categoryID.eq(category));
        }
        Page<Expense> page = expenseRepository.findAll(booleanBuilder, pageable);

        ResponseWrapper<ExpenseDTO> spendingWrapper = new ResponseWrapper();
        List<Expense> content = page.getContent();
        List<ExpenseDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<Category> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                Category sc = data.get();
                response.add(new ExpenseDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getMoneySpent(), item.getDescription(), item.getCurrency()));
            }
        });
        spendingWrapper.setData(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity save(Expense expense) {
        this.accountService.checkAccount(expense.getAccount());
        expense.setUser(securityContextService.username());
        accountService.removeFromBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
        expenseRepository.save(expense);
        historyService.save(historyService.from(EntityAction.CREATE, EXPENSE));
        return ResponseEntity.ok(expense);
    }

    @Override
    public ResponseEntity findOne(String id) {
        Expense expense = expenseRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense with id: " + id + " was not found.")
                );
        return ResponseEntity.ok(expense);
    }

    @Override
    public ResponseEntity delete(String id) {
        Expense expense = (Expense) findOne(id).getBody();
        accountService.addToBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
        expenseRepository.delete(expense);
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Expense spending) {
        this.accountService.checkAccount(spending.getAccount());
        spending.setUser(securityContextService.username());
        Expense expense = (Expense) findOne(id).getBody();
        double removeAndAddAmount = expense.getMoneySpent() - spending.getMoneySpent();
        accountService.addToBalance(expense.getAccount(), expense.getCurrency(), removeAndAddAmount);
        spending.setId(id);
        spending.setCreatedTime(expense.getCreatedTime());
        spending.setLastModifiedDate(new Date());
        expenseRepository.save(spending);
        historyService.save(historyService.from(EntityAction.UPDATE, EXPENSE));
        return ResponseEntity.ok(spending);
    }
}
