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
     * If non-null, this expense was created automatically as a side-effect of adding the
     * referenced project {@link Contribution}. Deleting either side of the link cleans
     * up the other (and refunds the balance) so the two stay consistent.
     */
    private String contributionId;
}
