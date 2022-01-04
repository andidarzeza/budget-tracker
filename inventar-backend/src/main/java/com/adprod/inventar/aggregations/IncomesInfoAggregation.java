package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.CategoryRepository;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
public class IncomesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;

    public IncomesInfoAggregation(MongoTemplate mongoTemplate, CategoryRepository categoryRepository) {
        this.mongoTemplate = mongoTemplate;
        this.categoryRepository = categoryRepository;
    }

    public List<IncomeInfoDTO> getIncomesInfo(String user, Instant from, Instant to) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$categoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("total"));
        TypedAggregation<Incoming> tempAgg = Aggregation.newAggregation(Incoming.class, aggregationResult);
        List<IncomeInfoDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incoming", IncomeInfoDTO.class).getMappedResults();
        List<IncomeInfoDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<SpendingCategory> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new IncomeInfoDTO(category.get().getCategory(), result.getTotal()));
            }
        });

        Collections.sort(response, Comparator.comparing(IncomeInfoDTO::getTotal));
        Collections.reverse(response);
        return response;
    }
}
