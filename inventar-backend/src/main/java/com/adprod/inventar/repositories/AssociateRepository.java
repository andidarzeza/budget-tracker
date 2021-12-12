package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Associate;
import com.adprod.inventar.models.PrenotedBook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssociateRepository extends MongoRepository<Associate, String> {
}
