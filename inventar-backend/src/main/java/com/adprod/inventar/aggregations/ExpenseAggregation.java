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
import java.util.stream.Collectors;

import com.adprod.inventar.models.CurrencyTotalDTO;

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

    /**
     * Sum {@code moneySpent} grouped by {@code currency}. Entries with null or zero total are removed.
     */
    public List<CurrencyTotalDTO> getTotalExpensesByCurrency(Instant from, Instant to, String account) {
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ops.add(Aggregation.group("$currency").sum("$moneySpent").as("total"));
        TypedAggregation<Expense> agg = Aggregation.newAggregation(Expense.class, ops);
        List<CurrencyTotalDTO> rows = mongoTemplate.aggregate(agg, "spending", CurrencyTotalDTO.class).getMappedResults();
        return rows.stream()
                .filter(r -> r.getTotal() != null && r.getTotal() != 0.0)
                .collect(Collectors.toList());
    }
}
