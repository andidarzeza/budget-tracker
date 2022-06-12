package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.DailyExpenseDTO;
import com.adprod.inventar.models.Expense;
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
public class DailyExpenseAggregation {
    private final MongoTemplate mongoTemplate;

    public DailyExpenseAggregation(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<DailyExpenseDTO> getDailyExpenses(String user, Instant from, Instant to) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(
                Aggregation
                        .project("$moneySpent")
                        .andExpression("{$dateToString: { format: '%d-%m-%Y', date: '$createdTime'}}").as("date")
        );
        aggregationResult.add(Aggregation.group("$date").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("dailyExpense"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<DailyExpenseDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", DailyExpenseDTO.class).getMappedResults();
        return resultSR;
    }
}
