package com.adprod.inventar.aggregations;

import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class BaseAggregation {

    private final SecurityContextService securityContextService;

    public List<AggregationOperation> baseAggregation(Instant from, Instant to, String account) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        // Half-open range [from, to): when "to" is the first instant of the next period, events at
        // exactly that boundary belong to the next bucket and must be excluded from this one.
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from).lt(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(securityContextService.username())));
        aggregationResult.add(Aggregation.match(Criteria.where("account").is(account)));
        return aggregationResult;
    }
}
