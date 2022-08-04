package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String>, QuerydslPredicateExecutor<Category> {

}
