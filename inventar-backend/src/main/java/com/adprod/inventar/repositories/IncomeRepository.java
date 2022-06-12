package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends MongoRepository<Income, String> {
    Page<Income> findAllByUser(Pageable pageable, String user);
}
