package com.adprod.inventar.services;

import org.springframework.http.ResponseEntity;

public interface DashboardService {
    ResponseEntity getDailySpendings();
    ResponseEntity getCategoriesData();
    ResponseEntity getIncomeCategoriesData();
}
