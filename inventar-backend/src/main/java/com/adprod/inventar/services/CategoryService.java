package com.adprod.inventar.services;

import com.adprod.inventar.models.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface CategoryService {
    ResponseEntity findAll(Pageable pageable, Map<String, String> params);
    ResponseEntity findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity save(Category category);
    ResponseEntity update(Category category);
}
