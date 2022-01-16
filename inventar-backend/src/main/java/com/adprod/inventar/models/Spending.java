package com.adprod.inventar.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document
@NoArgsConstructor
@Getter
@Setter
public class Spending {

    @Id
    private String id;
    private Date createdTime = new Date();
    private Date lastModifiedDate = this.createdTime;
    private String name;
    private Double moneySpent;
    private String description;
    private String categoryID;
    private String user;
}
