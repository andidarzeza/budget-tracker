package com.adprod.inventar.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Document
@NoArgsConstructor
@Setter
@Getter
public class ExpenseCategory {
    @Id
    private String id;
    private String icon;
    private String category;
    private LocalDateTime lastModifiedDate = LocalDateTime.now();
    private String description;
    private String categoryType;
    private String user;
}
