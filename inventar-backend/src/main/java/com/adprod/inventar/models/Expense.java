package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "spending")
@NoArgsConstructor
@Getter
@Setter
@QueryEntity
public class Expense {

    @Id
    private String id;
    private Date createdTime = new Date();
    private Date lastModifiedDate = this.createdTime;
    private Double moneySpent;
    private String description;
    private String categoryID;
    private String user;
    private String currency;
}
