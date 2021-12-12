package com.adprod.inventar.services;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface StatisticsService {
    ResponseEntity getRankingTable(Pageable pageable);
}
