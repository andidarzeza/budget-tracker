package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
@AllArgsConstructor
public class IncomesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final BaseAggregation baseAggregation;

    public List<IncomeInfoDTO> getIncomesInfo(Instant from, Instant to, String account) {
        List<AggregationOperation> aggregationResult = baseAggregation.baseAggregation(from, to, account);
        aggregationResult.add(Aggregation.group("$categoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("total"));
        TypedAggregation<Income> tempAgg = Aggregation.newAggregation(Income.class, aggregationResult);
        List<IncomeInfoDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incomes", IncomeInfoDTO.class).getMappedResults();
        List<IncomeInfoDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<Category> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new IncomeInfoDTO(category.get().getCategory(), result.getTotal()));
            }
        });

        Collections.sort(response, Comparator.comparing(IncomeInfoDTO::getTotal));
        Collections.reverse(response);
        return response;
    }
}
