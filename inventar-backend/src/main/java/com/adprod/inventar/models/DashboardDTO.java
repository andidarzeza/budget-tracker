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
    private Double expensesEUR;
    private Double averageExpensesEUR;
    private Double incomesEUR;
    private Double averageIncomesEUR;
}
