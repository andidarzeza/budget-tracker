package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.ExpenseInfoDTO;
import com.adprod.inventar.models.Spending;
import com.adprod.inventar.models.SpendingCategory;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExpensesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;

    public ExpensesInfoAggregation(MongoTemplate mongoTemplate, CategoryRepository categoryRepository) {
        this.mongoTemplate = mongoTemplate;
        this.categoryRepository = categoryRepository;
    }

    public List<ExpenseInfoDTO> getExpensesInfo(String user, Instant from, Instant to) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$categoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("total"));
        TypedAggregation<Spending> tempAgg = Aggregation.newAggregation(Spending.class, aggregationResult);
        List<ExpenseInfoDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseInfoDTO.class).getMappedResults();
        List<ExpenseInfoDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<SpendingCategory> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new ExpenseInfoDTO(category.get().getCategory(), result.getTotal()));
            }
        });
        return response;
    }
}
