package com.adprod.inventar.models;

import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
public class History {

    @Id
    private String id;
    private Date date = new Date();
    private EntityAction action;
    private String user;
    private String message;
    private EntityType entity;

    public History(EntityAction action, String user, String message, EntityType entity) {
        this.action = action;
        this.user = user;
        this.message = message;
        this.entity = entity;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public EntityAction getAction() {
        return action;
    }

    public void setAction(EntityAction action) {
        this.action = action;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public EntityType getEntity() {
        return entity;
    }

    public void setEntity(EntityType entity) {
        this.entity = entity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
