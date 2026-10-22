package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Income;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends MongoRepository<Income, String>, QuerydslPredicateExecutor<Income> {
}
