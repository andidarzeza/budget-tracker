package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.SpendingCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<SpendingCategory, String> {
}
