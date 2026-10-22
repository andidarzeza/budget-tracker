package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Contribution;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContributionRepository extends MongoRepository<Contribution, String> {
    List<Contribution> findAllByProjectIdOrderByCreatedTimeDesc(String projectId);
    void deleteAllByProjectId(String projectId);
}
