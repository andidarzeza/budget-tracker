package com.adprod.inventar.aggregations;


import com.adprod.inventar.models.*;
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
public class IncomesInfoAggregation {
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final BaseAggregation baseAggregation;

    /**
     * Per-category income totals, split by currency. Cross-currency sums are not meaningful
     * (€100 + $100 ≠ 200 of anything), so each (categoryID, currency) pair gets its own row.
     */
    public List<IncomeInfoDTO> getIncomesInfo(Instant from, Instant to, String account) {
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ops.add(
                Aggregation.group(
                                Fields.fields()
                                        .and("categoryID", "$categoryID")
                                        .and("currency", "$currency"))
                        .sum("$incoming").as("total"));
        ops.add(ctx -> new Document("$project",
                new Document("total", 1)
                        .append("_id", "$_id.categoryID")
                        .append("currency", "$_id.currency")));

        TypedAggregation<Income> agg = Aggregation.newAggregation(Income.class, ops);
        List<IncomeInfoDTO> raw = mongoTemplate.aggregate(agg, "incomes", IncomeInfoDTO.class).getMappedResults();

        List<IncomeInfoDTO> response = new ArrayList<>();
        for (IncomeInfoDTO row : raw) {
            Optional<Category> category = categoryRepository.findById(row.get_id());
            if (category.isPresent()) {
                response.add(new IncomeInfoDTO(
                        category.get().getCategory(),
                        row.getTotal(),
                        row.getCurrency()));
            }
        }
        response.sort(Comparator.comparing(IncomeInfoDTO::getTotal).reversed());
        return response;
    }
}
