package com.adprod.inventar.services;

import com.adprod.inventar.models.SpendingCategory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface CategoryService {
    ResponseEntity findAll(Pageable pageable, String categoryType);
    ResponseEntity findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity save(SpendingCategory spendingCategory);
    ResponseEntity update(SpendingCategory spendingCategory);
}
