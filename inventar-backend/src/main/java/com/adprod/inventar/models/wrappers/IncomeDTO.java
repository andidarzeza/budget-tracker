package com.adprod.inventar.models.wrappers;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class IncomeDTO {
    private String id;
    private String category;
    private String categoryID;
    private Date createdTime;
    private Date lastModifiedDate;
    private String name;
    private Double incoming;
    private String description;
    private String currency;

    public IncomeDTO(String id, String category, String categoryID, Date createdTime, Date lastModifiedDate, String name, Double incoming, String description, String currency) {
        this.id = id;
        this.category = category;
        this.categoryID = categoryID;
        this.createdTime = createdTime;
        this.lastModifiedDate = lastModifiedDate;
        this.name = name;
        this.incoming = incoming;
        this.description = description;
        this.currency = currency;
    }
}
