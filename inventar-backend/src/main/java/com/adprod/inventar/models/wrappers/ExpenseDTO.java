package com.adprod.inventar.models.wrappers;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
public class ExpenseDTO {
    private String id;
    private String category;
    private String categoryID;
    private LocalDateTime createdTime;
    private LocalDateTime lastModifiedDate;
    private Double moneySpent;
    private String description;
    private String currency;

}
