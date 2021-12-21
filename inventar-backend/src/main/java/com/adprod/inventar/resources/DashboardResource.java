package com.adprod.inventar.resources;

import com.adprod.inventar.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardResource {
    private final DashboardService dashboardService;

    public DashboardResource(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity getDailyExpenses(@RequestParam String user){
        return dashboardService.getDailyExpenses(user);
    }

    @GetMapping("/incomes")
    public ResponseEntity getIncomeCategoriesData(@RequestParam String user){
        return dashboardService.getIncomeCategoriesData(user);
    }

    @GetMapping("/categories")
    public ResponseEntity getCategoriesData(@RequestParam String user){
        return dashboardService.getCategoriesData(user);
    }
}
