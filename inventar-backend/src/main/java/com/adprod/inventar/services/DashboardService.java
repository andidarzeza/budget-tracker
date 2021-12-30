package com.adprod.inventar.services;

import org.springframework.http.ResponseEntity;

import java.time.Instant;

public interface DashboardService {
    ResponseEntity getDailyExpenses(String user, Instant from, Instant to);
    ResponseEntity getCategoriesData(String user, Instant from, Instant to);
    ResponseEntity getIncomeCategoriesData(String user, Instant from, Instant to);
}
