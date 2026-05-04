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
    /** Per-currency income totals for the period; zeros omitted. */
    private List<CurrencyTotalDTO> incomeTotalsByCurrency;
    /** Per-currency expense totals for the period; zeros omitted. */
    private List<CurrencyTotalDTO> expenseTotalsByCurrency;
    /** Per-category expense breakdown for the period, sorted desc by total. */
    private List<ExpenseInfoDTO> expensesInfo;
    /** Per-category income breakdown for the period, sorted desc by total. */
    private List<IncomeInfoDTO> incomesInfo;
}
