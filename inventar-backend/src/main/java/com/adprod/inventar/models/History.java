package com.adprod.inventar.models;

import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
@Getter
@Setter
@QueryEntity
public class History {

    @Id
    private String id;
    private Date date = new Date();
    private Date lastModifiedDate = this.date;
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

}
