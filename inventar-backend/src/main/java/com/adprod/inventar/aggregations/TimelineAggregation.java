package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.Income;
import com.adprod.inventar.models.TimelineExpenseDTO;
import com.adprod.inventar.models.TimelineIncomeDTO;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@Service
@AllArgsConstructor
public class TimelineAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    public List<TimelineExpenseDTO> expensesTimeline(Instant from, Instant to, String account, String range) {
        String dateFormat = "'%H'";
        if(range.equals("MONTH")) {
            dateFormat = "'%d'";
        }
        if(range.equals("DAY")) {
            dateFormat = "'%H'";
        }

        if(range.equals("YEAR")) {
            dateFormat = "'%m'";
        }
//        dateFormat = range.equals("Monthly") ? "'%d-%m-%Y'" : "'%m-%Y'";
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        ZoneId zoneId = ZoneId.systemDefault();
        aggregationResult.add(
                Aggregation
                        .project("$moneySpent")
                        .andExpression("{$dateToString: { timezone: '" + zoneId.getId() + "', format: " + dateFormat + ", date: '$createdTime'}}").as("date")
        );
        aggregationResult.add(Aggregation.group("$date").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("dailyExpense"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<TimelineExpenseDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", TimelineExpenseDTO.class).getMappedResults();
        return resultSR;
    }

    public List<TimelineIncomeDTO> incomesTimeline(Instant from, Instant to, String account, String range) {
        String dateFormat = "'%H'";
        if(range.equals("MONTH")) {
            dateFormat = "'%d'";
        }
//        dateFormat = range.equals("Monthly") ? "'%d-%m-%Y'" : "'%m-%Y'";
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        ZoneId zoneId = ZoneId.systemDefault();
        aggregationResult.add(
                Aggregation
                        .project("$incoming")
                        .andExpression("{$dateToString: { timezone: '" + zoneId.getId() + "', format: " + dateFormat + ", date: '$createdTime'}}").as("date")
        );
        aggregationResult.add(Aggregation.group("$date").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("income"));
        TypedAggregation<Income> tempAgg = Aggregation.newAggregation(Income.class, aggregationResult);
        List<TimelineIncomeDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incomes", TimelineIncomeDTO.class).getMappedResults();
        return resultSR;
    }

}
