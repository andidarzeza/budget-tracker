package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.ExpenseAggregationDTO;
import com.adprod.inventar.models.Income;
import com.adprod.inventar.models.IncomeAggregationDTO;
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
public class ExpenseAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    public Double getTotalExpensesForSelectedPeriod(Instant from, Instant to, String account) {
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("expenses"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<ExpenseAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseAggregationDTO.class).getMappedResults();
        return resultSR.size() > 0 ? resultSR.get(0).getExpenses() : 0.0;
    }
}
