package com.adprod.inventar.services;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

public interface HistoryService {
    ResponseEntity findAll(Pageable pageable, @RequestParam String user);
    ResponseEntity findOne(@PathVariable String id);
}
