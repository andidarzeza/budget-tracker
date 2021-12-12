package com.adprod.inventar.repositories;

import com.adprod.inventar.models.AssociatePoints;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AssociatePointsRepository extends MongoRepository<AssociatePoints, String> {
    Optional<AssociatePoints> findByAssociateID(String associateID);
    List<AssociatePoints> findAllByOrderByNumberOfBooksReadDesc(Pageable pageable);
}
