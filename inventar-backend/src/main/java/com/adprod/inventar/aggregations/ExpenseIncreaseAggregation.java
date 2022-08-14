package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.ExpenseAggregationDTO;
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
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ExpenseIncreaseAggregation {

    private final MongoTemplate mongoTemplate;
    private final SecurityContextService securityContextService;

    public Double getExpenseIncreaseValue(Instant from, Instant to, Double currentExpense, String range, String account) {
        from = from.atZone(ZoneId.systemDefault()).minusMonths(1).toInstant();
        to = to.atZone(ZoneId.systemDefault()).minusMonths(1).toInstant();
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(securityContextService.username())));
        aggregationResult.add(Aggregation.match(Criteria.where("account").is(account)));
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("expenses"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<ExpenseAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseAggregationDTO.class).getMappedResults();
        Double expenseLastMonth = resultSR.size() > 0 ? resultSR.get(0).getExpenses() : 0.0;
        Double averageLastMonth = this.calculateAverageForLastMonth(from, expenseLastMonth, range);
        return this.calculatePercentage(averageLastMonth, currentExpense);
    }

    private Double calculateAverageForLastMonth(Instant from, Double totalExpense, String range) {
        LocalDateTime ldt = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        LocalDateTime now = LocalDateTime.now();
        YearMonth yearMonthObject = YearMonth.of(ldt.getYear(), ldt.getMonth().getValue());
        int daysInMonth = range.equals("Monthly") ? yearMonthObject.lengthOfMonth(): now.getMonthValue(); //28
        return totalExpense / daysInMonth;
    }

    private Double calculatePercentage(Double lastMonthExpense, Double thisMonthExpense) {
        if(lastMonthExpense == 0.0) {
            return 0.0;
        }
        return (100*(thisMonthExpense - lastMonthExpense)/lastMonthExpense);
    }
}
