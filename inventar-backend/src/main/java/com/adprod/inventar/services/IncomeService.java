package com.adprod.inventar.services;

import com.adprod.inventar.models.Incoming;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface IncomeService {
    ResponseEntity findAll(Pageable pageable, String user);
    ResponseEntity save(Incoming incomeincoming);
    ResponseEntity findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(String id, Incoming income);
}
