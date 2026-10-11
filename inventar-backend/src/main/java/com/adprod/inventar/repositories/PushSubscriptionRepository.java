package com.adprod.inventar.repositories;

import com.adprod.inventar.models.PushSubscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends MongoRepository<PushSubscription, String> {
    List<PushSubscription> findAllByUser(String user);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpointAndUser(String endpoint, String user);
}
