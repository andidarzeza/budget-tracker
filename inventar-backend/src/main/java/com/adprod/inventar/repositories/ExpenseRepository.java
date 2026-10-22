package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String>, QuerydslPredicateExecutor<Expense> {
    /** The expense automatically created for a project contribution, if any. */
    Optional<Expense> findByContributionId(String contributionId);
    boolean existsByProjectId(String projectId);
}
