package com.adprod.inventar.services;

import com.adprod.inventar.models.ExpenseCategory;
import com.adprod.inventar.models.enums.CategoryType;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface CategoryService {
    ResponseEntity findAll(Pageable pageable, Map<String, String> params);
    ExpenseCategory findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity save(ExpenseCategory expenseCategory);
    ResponseEntity update(ExpenseCategory expenseCategory);
}
