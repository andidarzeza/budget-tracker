package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.CategoryType;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.CategoryWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.services.CategoryService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final SecurityContextService securityContextService;
    private final CategoryRepository categoryRepository;
    private final HistoryService historyService;
    private final EntityType entityType = EntityType.CATEGORY;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        String category = params.get("category");
        String description = params.get("description");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QExpenseCategory.expenseCategory.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QExpenseCategory.expenseCategory.categoryType.eq(params.get("categoryType")));
        if(Objects.nonNull(description)) {
            booleanBuilder = booleanBuilder.and(QExpenseCategory.expenseCategory.description.containsIgnoreCase(description));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QExpenseCategory.expenseCategory.category.containsIgnoreCase(category));
        }
        Page<ExpenseCategory> page = this.categoryRepository.findAll(booleanBuilder, pageable);
        CategoryWrapper categoryWrapper = new CategoryWrapper();
        categoryWrapper.setCategories(page.getContent());
        categoryWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(categoryWrapper);
    }

    @Override
    public ExpenseCategory findOne(String id) {
        return categoryRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense Category with id: " + id + " was not found!")
                );
    }

    @Override
    public ResponseEntity delete(String id) {
        ExpenseCategory category = findOne(id);
        categoryRepository.delete(category);
        historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
        return ResponseEntity.ok(new ResponseMessage("Category with id: " + id + " was deleted successfully."));
    }

    @Override
    public ResponseEntity save(ExpenseCategory expenseCategory) {
        expenseCategory.setUser(securityContextService.username());
        categoryRepository.save(expenseCategory);
        historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
        return ResponseEntity.ok(expenseCategory);
    }

    @Override
    public ResponseEntity update(ExpenseCategory expenseCategory) {
        expenseCategory.setUser(securityContextService.username());
        expenseCategory.setLastModifiedDate(LocalDateTime.now());
        categoryRepository.save(expenseCategory);
        historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
        return ResponseEntity.ok(expenseCategory);
    }
}
