package com.adprod.inventar.repositories;

import com.adprod.inventar.models.PushConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PushConfigRepository extends MongoRepository<PushConfig, String> {
}
