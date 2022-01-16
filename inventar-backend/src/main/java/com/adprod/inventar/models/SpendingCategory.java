package com.adprod.inventar.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
@NoArgsConstructor
@Setter
@Getter
public class SpendingCategory {
    @Id
    private String id;
    private String icon;
    private String category;
    private Date lastModifiedDate = new Date();
    private String description;
    private String categoryType;
    private String user;
}
