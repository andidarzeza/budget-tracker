package com.adprod.inventar.resources;

import com.adprod.inventar.models.Account;
import com.adprod.inventar.services.AccountService;
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
    public ResponseEntity getDailySpendings(){
        return dashboardService.getDailySpendings();
    }

    @GetMapping("/categories")
    public ResponseEntity getCategoriesData(){
        return dashboardService.getCategoriesData();
    }

}
