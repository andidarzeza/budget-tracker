package com.adprod.inventar.services;

import com.adprod.inventar.models.Account;
import org.springframework.http.ResponseEntity;

public interface DashboardService {
    ResponseEntity getDailySpendings();
    ResponseEntity getCategoriesData();
}
