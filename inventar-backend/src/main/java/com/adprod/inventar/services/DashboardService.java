package com.adprod.inventar.services;

import com.adprod.inventar.models.DashboardDTO;
import org.springframework.http.ResponseEntity;
import java.time.Instant;

public interface DashboardService {
    ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to, String range, String account);
}
