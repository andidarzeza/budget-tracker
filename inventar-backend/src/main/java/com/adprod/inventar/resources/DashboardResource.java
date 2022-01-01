package com.adprod.inventar.resources;

import com.adprod.inventar.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {
    private final DashboardService dashboardService;

    public DashboardResource(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity getDashboardData(@RequestParam Instant from, @RequestParam Instant to){
        return dashboardService.getDashboardData(from, to);
    }
}
