package com.adprod.inventar.services;

import com.adprod.inventar.models.DashboardDTO;
import com.adprod.inventar.models.TimelineExpenseDTO;
import com.adprod.inventar.models.TimelineIncomeDTO;
import com.adprod.inventar.models.enums.RangeType;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

public interface DashboardService {
    ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to, RangeType range, String account);

    ResponseEntity<List<TimelineExpenseDTO>> expensesTimeline(String account, Instant from, Instant to, String range);

    ResponseEntity<List<TimelineIncomeDTO>> incomesTimeline(String account, Instant from, Instant to, String range);
}
