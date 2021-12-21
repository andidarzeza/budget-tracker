package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Configuration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository extends MongoRepository<Configuration, String> {
    Optional<Configuration> findByUser(String user);
}
