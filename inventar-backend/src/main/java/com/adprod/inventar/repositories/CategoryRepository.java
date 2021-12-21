package com.adprod.inventar.repositories;

import com.adprod.inventar.models.SpendingCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<SpendingCategory, String> {
    Page<SpendingCategory> findAllByCategoryTypeAndUser(Pageable pageable, String categoryType, String user);
}
