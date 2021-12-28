package com.adprod.inventar.services.implementations;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final EntityType entityType = EntityType.EXPENSE;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, CategoryRepository categoryRepository, AccountService accountService, HistoryService historyService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.accountService = accountService;
        this.historyService = historyService;
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
                response.add(new SpendingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getName(), item.getMoneySpent(), item.getDescription()));
            }
        });
        spendingWrapper.setSpendings(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity save(Spending spending) {
        if(this.accountService.removeFromBalance(spending.getMoneySpent())) {
            expenseRepository.save(spending);
            historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
            return ResponseEntity.ok(spending);
        }
        return new ResponseEntity(new ResponseMessage("INTERNAL SERVER ERROR"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity findOne(String id) {
        return null;
    }

    @Override
    public ResponseEntity delete(String id) {
        Optional<Spending> spending = expenseRepository.findById(id);
        if(spending.isPresent()) {
            expenseRepository.delete(spending.get());
            historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity update(String id, Spending spending) {
        Optional<Spending> expenseOptional = expenseRepository.findById(id);
        if(expenseOptional.isPresent()) {
            spending.setId(id);
            expenseRepository.save(spending);
            historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
            return ResponseEntity.ok(spending);
        }
        return new ResponseEntity(new ResponseMessage("No Expense to update was found."), HttpStatus.NOT_FOUND);
    }
}