package com.adprod.inventar.resources;

import com.adprod.inventar.services.DashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@AllArgsConstructor
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity getDashboardData(@RequestParam Instant from, @RequestParam Instant to, @RequestParam String range){
        return dashboardService.getDashboardData(from, to, range);
    }
}
