package com.adprod.inventar.models.wrappers;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ExpenseDTO {
    private String id;
    private String category;
    private String categoryID;
    private Date createdTime;
    private Date lastModifiedDate;
    private Double moneySpent;
    private String description;

    public ExpenseDTO(String id, String category, String categoryID, Date createdTime, Date lastModifiedDate, Double moneySpent, String description) {
        this.id = id;
        this.category = category;
        this.categoryID = categoryID;
        this.createdTime = createdTime;
        this.lastModifiedDate = lastModifiedDate;
        this.moneySpent = moneySpent;
        this.description = description;
    }
}
