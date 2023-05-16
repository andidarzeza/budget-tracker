package com.adprod.inventar.resources;

import com.adprod.inventar.models.DashboardDTO;
import com.adprod.inventar.models.TimelineExpenseDTO;
import com.adprod.inventar.models.TimelineIncomeDTO;
import com.adprod.inventar.models.enums.RangeType;
import com.adprod.inventar.services.DashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardData(@RequestParam String account, @RequestParam Instant from, @RequestParam Instant to, @RequestParam RangeType range){
        return dashboardService.getDashboardData(from, to, range, account);
    }

    @GetMapping("/expenses-timeline")
    public ResponseEntity<List<TimelineExpenseDTO>> expensesTimeline(@RequestParam String account, @RequestParam Instant from, @RequestParam Instant to, @RequestParam String range) {
        return dashboardService.expensesTimeline(account, from, to, range);
    }

    @GetMapping("/incomes-timeline")
    public ResponseEntity<List<TimelineIncomeDTO>> incomesTimeline(@RequestParam String account, @RequestParam Instant from, @RequestParam Instant to, @RequestParam String range) {
        return dashboardService.incomesTimeline(account, from, to, range);
    }

}
