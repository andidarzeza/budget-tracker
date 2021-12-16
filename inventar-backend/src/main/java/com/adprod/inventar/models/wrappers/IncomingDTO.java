package com.adprod.inventar.models.wrappers;

import java.util.Date;

public class IncomingDTO {
    private String id;
    private String category;
    private String categoryID;
    private Date createdTime;
    private String name;
    private Double incoming;
    private String description;

    public IncomingDTO(String id, String category, String categoryID, Date createdTime, String name, Double incoming, String description) {
        this.id = id;
        this.category = category;
        this.categoryID = categoryID;
        this.createdTime = createdTime;
        this.name = name;
        this.incoming = incoming;
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

    public Double getIncoming() {
        return incoming;
    }

    public void setIncoming(Double moneySpent) {
        this.incoming = incoming;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
