package com.adprod.inventar.services;

import com.adprod.inventar.models.Expense;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface ExpenseService {
    ResponseEntity getExpenses(Pageable pageable, Map<String, String> params);
    ResponseEntity save(Expense expense);
    Expense findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(String id, Expense expense);
}
