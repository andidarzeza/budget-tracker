package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class DashboardDTO {
    private List<DailyExpenseDTO> dailyExpenses;
    private Double averageDailyIncome;
    private Double averageDailyExpenses;
    private Double incomes;
    private Double expenses;
    private List<ExpenseInfoDTO> expensesInfo;
    private List<IncomeInfoDTO> incomesInfo;
}
