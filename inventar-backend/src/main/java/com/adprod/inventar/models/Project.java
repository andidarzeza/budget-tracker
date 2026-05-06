package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A savings goal — e.g. "Trip to Paris", "New car". Users add {@link Contribution}s in any
 * currency, and progress is tracked against {@code targetAmount} in {@code targetCurrency}.
 */
@Document(collection = "projects")
@NoArgsConstructor
@Getter
@Setter
@QueryEntity
public class Project {

    @Id
    private String id;
    private LocalDateTime createdTime = LocalDateTime.now();
    private LocalDateTime lastModifiedDate = this.createdTime;
    private String name;
    private String description;
    private Double targetAmount;
    private String targetCurrency;
    private String icon;
    private boolean archived;
    private String user;
    private String account;
}
