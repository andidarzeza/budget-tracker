package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Incoming;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomingRepository extends MongoRepository<Incoming, String> {

}
