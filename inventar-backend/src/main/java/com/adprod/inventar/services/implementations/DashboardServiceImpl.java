package com.adprod.inventar.services.implementations;

import com.adprod.inventar.aggregations.ExpenseAggregation;
import com.adprod.inventar.aggregations.ExpensesInfoAggregation;
import com.adprod.inventar.aggregations.IncomeAggregation;
import com.adprod.inventar.aggregations.IncomesInfoAggregation;
import com.adprod.inventar.aggregations.TimelineAggregation;
import com.adprod.inventar.models.DashboardDTO;
import com.adprod.inventar.models.TimelineExpenseDTO;
import com.adprod.inventar.models.TimelineIncomeDTO;
import com.adprod.inventar.models.enums.RangeType;
import com.adprod.inventar.services.DashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final IncomeAggregation incomeAggregation;
    private final ExpenseAggregation expenseAggregation;
    private final ExpensesInfoAggregation expensesInfoAggregation;
    private final IncomesInfoAggregation incomesInfoAggregation;
    private final TimelineAggregation timelineAggregation;

    @Override
    public ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to, RangeType range, String account) {
        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setIncomeTotalsByCurrency(incomeAggregation.getTotalIncomesByCurrency(from, to, account));
        dashboardDTO.setExpenseTotalsByCurrency(expenseAggregation.getTotalExpensesByCurrency(from, to, account));
        dashboardDTO.setExpensesInfo(expensesInfoAggregation.getExpensesInfo(from, to, account));
        dashboardDTO.setIncomesInfo(incomesInfoAggregation.getIncomesInfo(from, to, account));
        return ResponseEntity.ok(dashboardDTO);
    }

    @Override
    public ResponseEntity<List<TimelineExpenseDTO>> expensesTimeline(String account, Instant from, Instant to, String range) {
        return ResponseEntity.ok(timelineAggregation.expensesTimeline(from, to, account, range));
    }

    @Override
    public ResponseEntity<List<TimelineIncomeDTO>> incomesTimeline(String account, Instant from, Instant to, String range) {
        return ResponseEntity.ok(timelineAggregation.incomesTimeline(from, to, account, range));
    }
}
