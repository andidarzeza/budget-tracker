package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.ExpenseInfoDTO;
import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.Category;
import com.adprod.inventar.repositories.CategoryRepository;
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
import java.util.*;

@Service
@AllArgsConstructor
public class ExpensesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final SecurityContextService securityContextService;

    public List<ExpenseInfoDTO> getExpensesInfo(Instant from, Instant to, String account) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").gte(from)));
        aggregationResult.add(Aggregation.match(Criteria.where("createdTime").lte(to)));
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(securityContextService.username())));
        aggregationResult.add(Aggregation.match(Criteria.where("account").is(account)));
        aggregationResult.add(Aggregation.group("$categoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("total"));
        TypedAggregation<Expense> tempAgg = Aggregation.newAggregation(Expense.class, aggregationResult);
        List<ExpenseInfoDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", ExpenseInfoDTO.class).getMappedResults();
        List<ExpenseInfoDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<Category> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new ExpenseInfoDTO(category.get().getCategory(), category.get().getIcon(), result.getTotal()));
            }
        });
        Collections.sort(response, Comparator.comparing(ExpenseInfoDTO::getTotal));
        Collections.reverse(response);
        return response;
    }
}
