package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    Page<Expense> findAllByUser(Pageable pageable, String user);
}
