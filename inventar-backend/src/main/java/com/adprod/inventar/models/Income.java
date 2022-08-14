package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "incomes")
@NoArgsConstructor
@Getter
@Setter
@QueryEntity
public class Income {

    @Id
    private String id;
    private Date createdTime = new Date();
    private Date lastModifiedDate = this.createdTime;
    private String name;
    private Double incoming;
    private String description;
    private String categoryID;
    private String user;
    private String currency;
    private String account;

    public Income(String id, String name, Double incoming, String description, String categoryID, String user, String currency) {
        this.id = id;
        this.name = name;
        this.incoming = incoming;
        this.description = description;
        this.categoryID = categoryID;
        this.user = user;
        this.currency = currency;
    }
}
