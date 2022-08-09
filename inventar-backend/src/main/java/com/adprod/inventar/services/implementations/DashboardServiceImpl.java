package com.adprod.inventar.services.implementations;

import com.adprod.inventar.aggregations.*;
import com.adprod.inventar.models.*;
import com.adprod.inventar.services.DashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
@AllArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DailyExpenseAggregation dailyExpenseAggregation;
    private final AverageIncomeAggregation averageIncomeAggregation;
    private final AverageExpenseAggregation averageExpenseAggregation;
    private final ExpensesInfoAggregation expensesInfoAggregation;
    private final IncomesInfoAggregation incomesInfoAggregation;
    private final IncomeAggregation incomeAggregation;
    private final IncomeIncreaseAggregation incomeIncreaseAggregation;
    private final ExpenseIncreaseAggregation expenseIncreaseAggregation;

    @Override
    public ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to, String range) {
        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setDailyExpenses(dailyExpenseAggregation.getDailyExpenses(from, to, range));
        dashboardDTO.setAverageDailyIncome(averageIncomeAggregation.getAverageDailyIncome(from, to, range));
        dashboardDTO.setAverageDailyExpenses(averageExpenseAggregation.getAverageDailyExpense(from, to, range));
        dashboardDTO.setExpensesInfo(expensesInfoAggregation.getExpensesInfo(from, to));
        dashboardDTO.setIncomesInfo(incomesInfoAggregation.getIncomesInfo(from, to));
        dashboardDTO.setIncomes(incomeAggregation.getIncomes(from, to));
        dashboardDTO.setExpenses(dashboardDTO.getDailyExpenses().stream().map(dailyExpenseDTO -> dailyExpenseDTO.getDailyExpense()).reduce((a, b) -> a+b).orElse(0.0));
        dashboardDTO.setIncreaseInExpense(expenseIncreaseAggregation.getExpenseIncreaseValue(from, to, dashboardDTO.getAverageDailyExpenses(), range));
        dashboardDTO.setIncreaseInIncome(incomeIncreaseAggregation.getIncomeIncreaseValue(from, to, dashboardDTO.getAverageDailyIncome()));
        return ResponseEntity.ok(dashboardDTO);
    }

}
