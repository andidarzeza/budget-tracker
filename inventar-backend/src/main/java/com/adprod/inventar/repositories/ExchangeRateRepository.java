package com.adprod.inventar.repositories;

import com.adprod.inventar.models.ExchangeRate;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends MongoRepository<ExchangeRate, String> {

    Optional<ExchangeRate> findByCurrencyAndDate(String currency, String date);

    Optional<ExchangeRate> findFirstByCurrencyOrderByDateDesc(String currency);

    /** Inclusive on both ends (dates are yyyy-MM-dd strings, so they sort chronologically). */
    @Query("{ 'currency': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<ExchangeRate> findInRange(String currency, String from, String to, Sort sort);

    List<ExchangeRate> findAllByCurrencyOrderByDateAsc(String currency);

}
