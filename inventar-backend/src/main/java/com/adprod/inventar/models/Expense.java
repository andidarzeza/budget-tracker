package com.adprod.inventar.models;

import com.querydsl.core.annotations.QueryEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Document(collection = "spending")
@NoArgsConstructor
@Getter
@Setter
@QueryEntity
public class Expense {

    @Id
    private String id;
    private LocalDateTime createdTime = LocalDateTime.now();
    private LocalDateTime lastModifiedDate = this.createdTime;
    private Double moneySpent;
    private String description;
    private String categoryID;
    private String user;
    private String currency;
    private String account;
    /** Money source this expense was paid from. Its currency drives {@link #currency}. */
    private String walletId;
    /**
     * Set when the expense was paid out of a project's savings (its category is that
     * project's category). Such an expense has no {@link #walletId}; it lowers the project's
     * saved total instead of a source balance.
     */
    private String projectId;
    /**
     * Legacy: contributions used to be mirrored as "Savings" expenses. They are transfers now
     * (see ProjectFundsMigrationRunner); kept so any remaining link can still be cleaned up.
     */
    private String contributionId;
}
