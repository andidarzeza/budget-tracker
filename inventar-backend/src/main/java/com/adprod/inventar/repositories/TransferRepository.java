package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Transfer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferRepository extends MongoRepository<Transfer, String> {
    List<Transfer> findAllByUserAndAccountOrderByCreatedTimeDesc(String user, String account);
}
