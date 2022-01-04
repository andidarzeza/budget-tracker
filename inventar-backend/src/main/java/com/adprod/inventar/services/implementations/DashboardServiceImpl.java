package com.adprod.inventar.services.implementations;

import com.adprod.inventar.aggregations.*;
import com.adprod.inventar.models.*;
import com.adprod.inventar.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final DailyExpenseAggregation dailyExpenseAggregation;
    private final AverageIncomeAggregation averageIncomeAggregation;
    private final AverageExpenseAggregation averageExpenseAggregation;
    private final ExpensesInfoAggregation expensesInfoAggregation;
    private final IncomesInfoAggregation incomesInfoAggregation;
    private final IncomeAggregation incomeAggregation;
    private final IncomeIncreaseAggregation incomeIncreaseAggregation;
    private final ExpenseIncreaseAggregation expenseIncreaseAggregation;

    public DashboardServiceImpl(DailyExpenseAggregation dailyExpenseAggregation, AverageIncomeAggregation averageIncomeAggregation, AverageExpenseAggregation averageExpenseAggregation, ExpensesInfoAggregation expensesInfoAggregation, IncomesInfoAggregation incomesInfoAggregation, IncomeAggregation incomeAggregation, IncomeIncreaseAggregation incomeIncreaseAggregation, ExpenseIncreaseAggregation expenseIncreaseAggregation) {
        this.dailyExpenseAggregation = dailyExpenseAggregation;
        this.averageIncomeAggregation = averageIncomeAggregation;
        this.averageExpenseAggregation = averageExpenseAggregation;
        this.expensesInfoAggregation = expensesInfoAggregation;
        this.incomesInfoAggregation = incomesInfoAggregation;
        this.incomeAggregation = incomeAggregation;
        this.incomeIncreaseAggregation = incomeIncreaseAggregation;
        this.expenseIncreaseAggregation = expenseIncreaseAggregation;
    }


    @Override
    public ResponseEntity<DashboardDTO> getDashboardData(Instant from, Instant to) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setDailyExpenses(dailyExpenseAggregation.getDailyExpenses(user, from, to));
        dashboardDTO.setAverageDailyIncome(averageIncomeAggregation.getAverageDailyIncome(user, from, to));
        dashboardDTO.setAverageDailyExpenses(averageExpenseAggregation.getAverageDailyExpense(user, from, to));
        dashboardDTO.setExpensesInfo(expensesInfoAggregation.getExpensesInfo(user, from, to));
        dashboardDTO.setIncomesInfo(incomesInfoAggregation.getIncomesInfo(user, from, to));
        dashboardDTO.setIncomes(incomeAggregation.getIncomes(user, from, to));
        dashboardDTO.setExpenses(dashboardDTO.getDailyExpenses().stream().map(dailyExpenseDTO -> dailyExpenseDTO.getDailyExpense()).reduce((a, b) -> a+b).get());
        dashboardDTO.setIncreaseInExpense(expenseIncreaseAggregation.getExpenseIncreaseValue(user, from, to, dashboardDTO.getAverageDailyExpenses()));
        dashboardDTO.setIncreaseInIncome(incomeIncreaseAggregation.getIncomeIncreaseValue(user, from, to, dashboardDTO.getAverageDailyIncome()));
        return ResponseEntity.ok(dashboardDTO);
    }

}
