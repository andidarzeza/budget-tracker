package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.ExpenseInfoDTO;
import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.Category;
import com.adprod.inventar.repositories.CategoryRepository;
import lombok.AllArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.Fields;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
@AllArgsConstructor
public class ExpensesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final BaseAggregation baseAggregation;

    /**
     * Per-category expense totals, split by currency. Cross-currency sums are not meaningful
     * (€100 + $100 ≠ 200 of anything), so each (categoryID, currency) pair gets its own row.
     */
    public List<ExpenseInfoDTO> getExpensesInfo(Instant from, Instant to, String account) {
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ops.add(
                Aggregation.group(
                                Fields.fields()
                                        .and("categoryID", "$categoryID")
                                        .and("currency", "$currency"))
                        .sum("$moneySpent").as("total"));
        // Flatten compound _id so the DTO mapper sees { _id, currency, total }.
        ops.add(ctx -> new Document("$project",
                new Document("total", 1)
                        .append("_id", "$_id.categoryID")
                        .append("currency", "$_id.currency")));

        TypedAggregation<Expense> agg = Aggregation.newAggregation(Expense.class, ops);
        List<ExpenseInfoDTO> raw = mongoTemplate.aggregate(agg, "spending", ExpenseInfoDTO.class).getMappedResults();

        List<ExpenseInfoDTO> response = new ArrayList<>();
        for (ExpenseInfoDTO row : raw) {
            Optional<Category> category = categoryRepository.findById(row.get_id());
            if (category.isPresent()) {
                response.add(new ExpenseInfoDTO(
                        category.get().getCategory(),
                        category.get().getIcon(),
                        row.getTotal(),
                        row.getCurrency()));
            }
        }
        response.sort(Comparator.comparing(ExpenseInfoDTO::getTotal).reversed());
        return response;
    }
}
