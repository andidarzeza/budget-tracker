package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class SpendingCategory {
    @Id
    private String id;
    private String icon;
    private String category;
    private String description;

    public SpendingCategory(String id, String icon, String category, String description) {
        this.id = id;
        this.icon = icon;
        this.category = category;
        this.description = description;
    }

    public SpendingCategory() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
