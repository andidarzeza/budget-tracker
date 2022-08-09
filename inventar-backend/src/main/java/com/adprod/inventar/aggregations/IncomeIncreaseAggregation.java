package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.IncomeAggregationDTO;
import com.adprod.inventar.models.Income;
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

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class IncomeIncreaseAggregation {

    private final MongoTemplate mongoTemplate;
    private final SecurityContextService securityContextService;

    public Double getIncomeIncreaseValue(Instant from, Instant to, Double currentIncome) {
        from = from.atZone(ZoneId.systemDefault()).minusMonths(1).toInstant();
        to = to.atZone(ZoneId.systemDefault()).minusMonths(1).toInstant();
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(securityContextService.username())));
        aggregationResult.add(Aggregation.group("$user").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("income"));
        TypedAggregation<Income> tempAgg = Aggregation.newAggregation(Income.class, aggregationResult);
        List<IncomeAggregationDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incomes", IncomeAggregationDTO.class).getMappedResults();
        Double incomeLastMonth = resultSR.size() > 0 ? resultSR.get(0).getIncome() : 0.0;
        Double averageLastMonth = this.calculateAverageForLastMonth(from, incomeLastMonth);
        return this.calculatePercentage(averageLastMonth, currentIncome);
    }

    private Double calculateAverageForLastMonth(Instant from, Double incomeLastMonth) {
        LocalDateTime ldt = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        YearMonth yearMonthObject = YearMonth.of(ldt.getYear(), ldt.getMonth().getValue());
        int daysInMonth = yearMonthObject.lengthOfMonth(); //28
        return incomeLastMonth / daysInMonth;
    }

    private Double calculatePercentage(Double lastMonthIncome, Double thisMonthIncome) {
        if(lastMonthIncome == 0.0) return 0.0;
        return  100 *(thisMonthIncome - lastMonthIncome) / lastMonthIncome;
    }
}
