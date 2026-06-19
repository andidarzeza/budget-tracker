package com.adprod.inventar.repositories;

import com.adprod.inventar.models.Wallet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends MongoRepository<Wallet, String> {
    List<Wallet> findAllByUserAndAccount(String user, String account);
    Optional<Wallet> findByIdAndUser(String id, String user);
    boolean existsByAccount(String account);
}
