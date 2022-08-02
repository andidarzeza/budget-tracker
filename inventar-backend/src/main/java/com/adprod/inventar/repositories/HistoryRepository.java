package com.adprod.inventar.repositories;

import com.adprod.inventar.models.History;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends MongoRepository<History, String>, QuerydslPredicateExecutor<History> {
    Page<History> findAllByUser(Pageable pageable, String user);
}
