package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.ExpenseAggregationDTO;
import com.adprod.inventar.models.Expense;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;

@Service
@AllArgsConstructor
public class AverageExpenseAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    public Double getAverageExpenses(Instant from, Instant to, String account) {
        LocalDateTime currentDate = LocalDateTime.now();
        LocalDateTime ldt = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        YearMonth yearMonthObject = YearMonth.of(ldt.getYear(), ldt.getMonth().getValue());
        int daysInMonth = yearMonthObject.lengthOfMonth(); //28
        if(currentDate.getYear() == ldt.getYear() && currentDate.getMonth().getValue() == ldt.getMonth().getValue()) {
            daysInMonth = currentDate.getDayOfMonth();
        }
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("expenses"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<ExpenseAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseAggregationDTO.class).getMappedResults();
        return resultSR.size() > 0 ? resultSR.get(0).getExpenses() / daysInMonth : 0.0;
    }
}
