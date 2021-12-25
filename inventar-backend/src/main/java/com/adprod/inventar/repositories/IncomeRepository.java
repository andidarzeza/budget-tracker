package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Incoming;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends MongoRepository<Incoming, String> {
    Page<Incoming> findAllByUser(Pageable pageable, String user);
}
