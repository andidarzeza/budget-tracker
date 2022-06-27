package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.EXPENSE;
import com.adprod.inventar.models.wrappers.SpendingDTO;
import com.adprod.inventar.models.wrappers.SpendingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity getExpenses(Pageable pageable) {
        Page<Expense> page = expenseRepository.findAllByUser(pageable, securityContextService.username());
        SpendingWrapper spendingWrapper = new SpendingWrapper();
        List<Expense> content = page.getContent();
        List<SpendingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<ExpenseCategory> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                ExpenseCategory sc = data.get();
                response.add(new SpendingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getMoneySpent(), item.getDescription()));
            }
        });
        spendingWrapper.setExpenses(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity save(Expense expense) {
        accountService.removeFromBalance(expense.getMoneySpent());
        expenseRepository.save(expense);
        historyService.save(historyService.from(EntityAction.CREATE, EXPENSE));
        return ResponseEntity.ok(expense);
    }

    @Override
    public Expense findOne(String id) {
        return expenseRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense with id: " + id + " was not found.")
                );
    }

    @Override
    public ResponseEntity delete(String id) {
        Expense expense = findOne(id);
        accountService.addToBalance(expense.getMoneySpent());
        expenseRepository.delete(expense);
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Expense spending) {
        Expense expense = findOne(id);
        double removeAndAddAmount = expense.getMoneySpent() - spending.getMoneySpent();
        accountService.addToBalance(removeAndAddAmount);
        spending.setId(id);
        spending.setCreatedTime(expense.getCreatedTime());
        spending.setLastModifiedDate(new Date());
        expenseRepository.save(spending);
        historyService.save(historyService.from(EntityAction.UPDATE, EXPENSE));
        return ResponseEntity.ok(spending);
    }
}
