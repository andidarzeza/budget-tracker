package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.IncomeAggregationDTO;
import com.adprod.inventar.models.Incoming;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncomeAggregation {

    private final MongoTemplate mongoTemplate;

    public IncomeAggregation(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Double getIncomes(String user, Instant from, Instant to) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("income"));
        TypedAggregation<Incoming> tempAgg = Aggregation.newAggregation(Incoming.class, aggregationResult);
        List<IncomeAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incoming", IncomeAggregationDTO.class).getMappedResults();
        return resultSR.size() > 0 ? resultSR.get(0).getIncome() : 0.0;
    }
}
