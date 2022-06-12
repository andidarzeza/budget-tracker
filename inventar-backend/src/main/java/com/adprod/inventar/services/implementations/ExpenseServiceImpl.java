package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.SpendingDTO;
import com.adprod.inventar.models.wrappers.SpendingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;
    private final EntityType entityType = EntityType.EXPENSE;


    public ExpenseServiceImpl(ExpenseRepository expenseRepository, CategoryRepository categoryRepository, AccountService accountService, HistoryService historyService, SecurityContextService securityContextService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.accountService = accountService;
        this.historyService = historyService;
        this.securityContextService = securityContextService;
    }

    @Override
    public ResponseEntity getExpenses(Pageable pageable, String user) {
        Page<Spending> page = this.expenseRepository.findAllByUser(pageable, user);
        SpendingWrapper spendingWrapper = new SpendingWrapper();
        List<Spending> content = page.getContent();
        List<SpendingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<SpendingCategory> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                SpendingCategory sc = data.get();
                response.add(new SpendingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getMoneySpent(), item.getDescription()));
            }
        });
        spendingWrapper.setExpenses(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity save(Spending spending) {
        this.accountService.removeFromBalance(spending.getMoneySpent());
        expenseRepository.save(spending);
        historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
        return ResponseEntity.ok(spending);
    }

    @Override
    public Spending findOne(String id) {
        return expenseRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense with id: " + id + " was not found.")
                );
    }

    @Override
    public ResponseEntity delete(String id) {
        Spending expense = findOne(id);
        this.accountService.addToBalance(expense.getMoneySpent());
        expenseRepository.delete(expense);
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Spending spending) {
        Spending expense = findOne(id);
        double removeAndAddAmount = expense.getMoneySpent() - spending.getMoneySpent();
        this.accountService.addToBalance(removeAndAddAmount);
        spending.setId(id);
        spending.setCreatedTime(expense.getCreatedTime());
        spending.setLastModifiedDate(new Date());
        expenseRepository.save(spending);
        historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
        return ResponseEntity.ok(spending);
    }
}
