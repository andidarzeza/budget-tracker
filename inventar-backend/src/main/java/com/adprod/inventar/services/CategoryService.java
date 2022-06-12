package com.adprod.inventar.services;

import com.adprod.inventar.models.ExpenseCategory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface CategoryService {
    ResponseEntity findAll(Pageable pageable, String categoryType);
    ExpenseCategory findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity save(ExpenseCategory expenseCategory);
    ResponseEntity update(ExpenseCategory expenseCategory);
}
