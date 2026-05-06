package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String>, QuerydslPredicateExecutor<Project> {
    List<Project> findAllByUserAndAccount(String user, String account);
}
