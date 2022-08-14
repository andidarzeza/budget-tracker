package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Account;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, String> {
    List<Account> findAllByUsername(String username);
    Optional<Account> findByUsernameAndAndId(String username, String id);
}
