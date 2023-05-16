package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.Expense;
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
public class DailyExpenseAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

//    public List<DailyExpenseDTO> getDailyExpenses(Instant from, Instant to, String range, String account) {
//        String dateFormat = range.equals("Monthly") ? "'%d-%m-%Y'" : "'%m-%Y'";
//        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
//        aggregationResult.add(
//                Aggregation
//                        .project("$moneySpent")
//                        .andExpression("{$dateToString: { format: " + dateFormat + ", date: '$createdTime'}}").as("date")
//        );
////        aggregationResult.add(Aggregation
////                .project("$currency"));
//        aggregationResult.add(Aggregation.group("$date").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("dailyExpense"));
//        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
//        List<DailyExpenseDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", DailyExpenseDTO.class).getMappedResults();
//        return resultSR;
//    }
}
