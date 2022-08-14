package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.DailyExpenseDTO;
import com.adprod.inventar.models.Expense;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
public class DailyExpenseAggregation {
    private final MongoTemplate mongoTemplate;
    private final SecurityContextService securityContextService;

    public List<DailyExpenseDTO> getDailyExpenses(Instant from, Instant to, String range, String account) {
        String dateFormat = range.equals("Monthly") ? "'%d-%m-%Y'" : "'%m-%Y'";
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(securityContextService.username())));
        aggregationResult.add(Aggregation.match(Criteria.where("account").is(account)));
        aggregationResult.add(
                Aggregation
                        .project("$moneySpent")
                        .andExpression("{$dateToString: { format: " + dateFormat + ", date: '$createdTime'}}").as("date")
        );
        aggregationResult.add(Aggregation.group("$date").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("dailyExpense"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<DailyExpenseDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", DailyExpenseDTO.class).getMappedResults();
        return resultSR;
    }
}
