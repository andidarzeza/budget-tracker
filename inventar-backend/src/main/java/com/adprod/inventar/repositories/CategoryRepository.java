package com.adprod.inventar.repositories;

import com.adprod.inventar.models.ExpenseCategory;
import com.adprod.inventar.models.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<ExpenseCategory, String>, QuerydslPredicateExecutor<ExpenseCategory> {
    Page<ExpenseCategory> findAllByCategoryTypeAndUser(Pageable pageable, String categoryType, String user);
}
