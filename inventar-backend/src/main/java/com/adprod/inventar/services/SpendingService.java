package com.adprod.inventar.services;

import com.adprod.inventar.models.Spending;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface SpendingService {
    ResponseEntity getSpendings(Pageable pageable);
    ResponseEntity addSpending(Spending spending);
    ResponseEntity getSpendObject(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(Spending spending);
}
