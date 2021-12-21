package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document
public class Spending {

    @Id
    private String id;
    private Date createdTime = new Date();
    private String name;
    private Double moneySpent;
    private String description;
    private String spendingCategoryID;
    private String user;

    public Spending(String id, String name, Double moneySpent, String description, String spendingCategoryID, String user) {
        this.id = id;
        this.name = name;
        this.moneySpent = moneySpent;
        this.description = description;
        this.spendingCategoryID = spendingCategoryID;
        this.user = user;
    }

    public Spending() {
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(Date createdTime) {
        this.createdTime = createdTime;
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

    public String getSpendingCategoryID() {
        return spendingCategoryID;
    }

    public void setSpendingCategoryID(String spendingCategoryID) {
        this.spendingCategoryID = spendingCategoryID;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
