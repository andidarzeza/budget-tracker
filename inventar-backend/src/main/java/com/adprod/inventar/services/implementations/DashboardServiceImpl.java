package com.adprod.inventar.services.implementations;

import com.adprod.inventar.aggregations.*;
import com.adprod.inventar.models.*;
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

    private final DailyExpenseAggregation dailyExpenseAggregation;
    private final AverageIncomeAggregation averageIncomeAggregation;
    private final AverageExpenseAggregation averageExpenseAggregation;
    private final ExpensesInfoAggregation expensesInfoAggregation;
    private final IncomesInfoAggregation incomesInfoAggregation;
    private final IncomeAggregation incomeAggregation;
    private final ExpenseAggregation expenseAggregation;

    private final IncomeIncreaseAggregation incomeIncreaseAggregation;
    private final ExpenseIncreaseAggregation expenseIncreaseAggregation;
    private final TimelineAggregation timelineAggregation;

    @Override
    public ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to, RangeType range, String account) {
        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setIncomesEUR(incomeAggregation.getTotalIncomeForSelectedPeriod(from, to, account));
        dashboardDTO.setExpensesEUR(expenseAggregation.getTotalExpensesForSelectedPeriod(from, to, account));
        dashboardDTO.setAverageExpensesEUR(averageExpenseAggregation.getAverageExpenses(from, to, account));
        dashboardDTO.setAverageIncomesEUR(averageIncomeAggregation.getAverageIncomes(from, to, account));
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
