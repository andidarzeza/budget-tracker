package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Document(collection = "category")
@NoArgsConstructor
@Setter
@Getter
@QueryEntity
public class Category {
    @Id
    private String id;
    private String icon;
    private String category;
    private LocalDateTime lastModifiedDate = LocalDateTime.now();
    private String description;
    private String categoryType;
    private String user;
}
