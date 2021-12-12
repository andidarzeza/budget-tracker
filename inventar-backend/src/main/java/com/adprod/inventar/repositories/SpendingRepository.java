package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Account;
import com.adprod.inventar.models.Spending;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpendingRepository extends MongoRepository<Spending, String> {
}
