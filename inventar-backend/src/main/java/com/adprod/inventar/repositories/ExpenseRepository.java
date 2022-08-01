package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String>, QuerydslPredicateExecutor<Expense> {
    Page<Expense> findAllByUser(Pageable pageable, String user);
    Page<Expense> findAllByUserAndCategoryID(Pageable pageable, String user, String categoryId);
}
