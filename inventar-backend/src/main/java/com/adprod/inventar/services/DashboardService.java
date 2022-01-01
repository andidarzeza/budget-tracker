package com.adprod.inventar.services;

import com.adprod.inventar.services.implementations.DashboardServiceImpl;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

public interface DashboardService {
    ResponseEntity<List<DashboardServiceImpl.DailySpendingsDTO>> getDailyExpenses(String user, Instant from, Instant to);
    ResponseEntity getCategoriesData(String user, Instant from, Instant to);
    ResponseEntity getIncomeCategoriesData(String user, Instant from, Instant to);
}
