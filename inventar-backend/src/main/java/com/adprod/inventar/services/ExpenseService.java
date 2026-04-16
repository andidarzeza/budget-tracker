package com.adprod.inventar.services;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.InvoiceVerificationFromUrlRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface ExpenseService {
    ResponseEntity findAll(Pageable pageable, Map<String, String> params);
    ResponseEntity save(Expense expense);
    ResponseEntity findOne(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(String id, Expense expense);
    ResponseEntity verifyInvoiceFromUrl(InvoiceVerificationFromUrlRequest request);
}
