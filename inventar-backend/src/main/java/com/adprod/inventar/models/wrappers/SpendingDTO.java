package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.Spending;
import org.springframework.data.annotation.Id;

import java.util.Date;
import java.util.List;

public class SpendingDTO {
    private String id;
    private String category;
    private String categoryID;
    private Date createdTime;
    private String name;
    private Double moneySpent;
    private String description;

    public SpendingDTO(String id, String category, String categoryID, Date createdTime, String name, Double moneySpent, String description) {
        this.id = id;
        this.category = category;
        this.categoryID = categoryID;
        this.createdTime = createdTime;
        this.name = name;
        this.moneySpent = moneySpent;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(String categoryID) {
        this.categoryID = categoryID;
    }

    public Date getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(Date createdTime) {
        this.createdTime = createdTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getMoneySpent() {
        return moneySpent;
    }

    public void setMoneySpent(Double moneySpent) {
        this.moneySpent = moneySpent;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
