package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.IncomeAggregationDTO;
import com.adprod.inventar.models.Income;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class IncomeAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    public Double getTotalIncomeForSelectedPeriod(Instant from, Instant to, String account) {
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("income"));
        TypedAggregation<Income> tempAgg = Aggregation.newAggregation(Income.class, aggregationResult);
        List<IncomeAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incomes", IncomeAggregationDTO.class).getMappedResults();
        return resultSR.size() > 0 ? resultSR.get(0).getIncome() : 0.0;
    }
}
