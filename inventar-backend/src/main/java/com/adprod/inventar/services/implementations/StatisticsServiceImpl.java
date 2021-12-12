package com.adprod.inventar.services.implementations;

import com.adprod.inventar.repositories.AssociatePointsRepository;
import com.adprod.inventar.services.StatisticsService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class StatisticsServiceImpl implements StatisticsService {
    private final AssociatePointsRepository associatePointsRepository;

    public StatisticsServiceImpl(AssociatePointsRepository associatePointsRepository) {
        this.associatePointsRepository = associatePointsRepository;
    }

    @Override
    public ResponseEntity getRankingTable(Pageable pageable) {
        return ResponseEntity.ok(associatePointsRepository.findAllByOrderByNumberOfBooksReadDesc(pageable));
    }
}
