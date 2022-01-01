package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.ExpenseAggregationDTO;
import com.adprod.inventar.models.Spending;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class AverageExpenseAggregation {

    private final MongoTemplate mongoTemplate;

    public AverageExpenseAggregation(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Double getAverageDailyExpense(String user, Instant from, Instant to) {
        LocalDateTime currentDate = LocalDateTime.ofInstant(Instant.now(), ZoneId.systemDefault());
        LocalDateTime ldt = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        YearMonth yearMonthObject = YearMonth.of(ldt.getYear(), ldt.getMonth().getValue());
        int daysInMonth = yearMonthObject.lengthOfMonth(); //28
        if(currentDate.getYear() == ldt.getYear() && currentDate.getMonth().getValue() == ldt.getMonth().getValue()) {
            daysInMonth = ldt.getDayOfMonth();
        }
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("expenses"));
        TypedAggregation<Spending> tempAgg = Aggregation.newAggregation(Spending.class, aggregationResult);
        List<ExpenseAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseAggregationDTO.class).getMappedResults();
        return resultSR.size() > 0 ? resultSR.get(0).getExpenses() / daysInMonth : 0.0;
    }
}
