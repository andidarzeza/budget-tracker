package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A single deposit toward a {@link Project}. Stored per-currency since cross-currency
 * sums aren't meaningful — the frontend shows totals by currency on each project card.
 */
@Document(collection = "contributions")
@NoArgsConstructor
@Getter
@Setter
@QueryEntity
public class Contribution {

    @Id
    private String id;
    private LocalDateTime createdTime = LocalDateTime.now();
    private LocalDateTime lastModifiedDate = this.createdTime;
    private String projectId;
    private Double amount;
    private String currency;
    private String description;
    private String user;
    private String account;
}
