package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class TimelineExpenseDTO {
    private String _id;
    private Double dailyExpense;
    private String currency;
}
