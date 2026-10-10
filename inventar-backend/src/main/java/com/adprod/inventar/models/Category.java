package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
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
    /** Optional amount pre-filled when this category is picked (repeat expenses, salary). */
    private Double defaultAmount;
    /**
     * Set on the category that represents a project in the expense picker. Expenses in it are
     * paid from that project's savings. Managed by the app, hidden from the Categories page.
     */
    private String projectId;
    /** How many expenses / incomes use it. Only filled by the by-usage listing; not stored. */
    @Transient
    private Long usageCount;
    private String user;
    private String account;
}
