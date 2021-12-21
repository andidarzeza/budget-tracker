package com.adprod.inventar.services;

import org.springframework.http.ResponseEntity;

public interface DashboardService {
    ResponseEntity getDailyExpenses(String user);
    ResponseEntity getCategoriesData(String user);
    ResponseEntity getIncomeCategoriesData(String user);
}
