package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.CurrencyTotalDTO;
import com.adprod.inventar.models.Income;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class IncomeAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    /**
     * Sum {@code incoming} grouped by {@code currency}. Entries with null or zero total are removed.
     */
    public List<CurrencyTotalDTO> getTotalIncomesByCurrency(Instant from, Instant to, String account) {
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ops.add(Aggregation.group("$currency").sum("$incoming").as("total"));
        TypedAggregation<Income> agg = Aggregation.newAggregation(Income.class, ops);
        List<CurrencyTotalDTO> rows = mongoTemplate.aggregate(agg, "incomes", CurrencyTotalDTO.class).getMappedResults();
        return rows.stream()
                .filter(r -> r.getTotal() != null && r.getTotal() != 0.0)
                .collect(Collectors.toList());
    }
}
