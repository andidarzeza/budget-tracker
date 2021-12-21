package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.CategoryRepository;
import org.springframework.data.mongodb.MongoExpression;
import com.adprod.inventar.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardServiceImpl implements DashboardService {
    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private CategoryRepository categoryRepository;

    private static class DailySpendingsDTO{
        String _id;
        Double total;

        public DailySpendingsDTO(String _id, Double total) {
            this._id = _id;
            this.total = total;
        }

        public String get_id() {
            return _id;
        }

        public void set_id(String _id) {
            this._id = _id;
        }

        public Double getTotal() {
            return total;
        }

        public void setTotal(Double total) {
            this.total = total;
        }
    }

    @Override
    public ResponseEntity getDailyExpenses(String user) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(
                Aggregation.project("$moneySpent")
                        .andExpression("{$dateToString: { format: '%d-%m-%Y', date: '$createdTime'}}").as("day")
        );
        aggregationResult.add(Aggregation.group("$day").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("total"));
        TypedAggregation<Spending> tempAgg = Aggregation.newAggregation(Spending.class, aggregationResult);
        List<DailySpendingsDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", DailySpendingsDTO.class).getMappedResults();
        return ResponseEntity.ok(resultSR);
    }

    @Override
    public ResponseEntity getCategoriesData(String user) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$spendingCategoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'"))).as("total"));
        TypedAggregation<Spending> tempAgg = Aggregation.newAggregation(Spending.class, aggregationResult);
        List<DailySpendingsDTO> resultSR = mongoTemplate.aggregate(tempAgg, "spending", DailySpendingsDTO.class).getMappedResults();
        List<DailySpendingsDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<SpendingCategory> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new DailySpendingsDTO(category.get().getCategory(), result.getTotal()));
            }
        });
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity getIncomeCategoriesData(String user) {
        List<AggregationOperation> aggregationResult = new ArrayList<>();
        aggregationResult.add(Aggregation.match(Criteria.where("user").is(user)));
        aggregationResult.add(Aggregation.group("$spendingCategoryID").sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'"))).as("total"));
        TypedAggregation<Incoming> tempAgg = Aggregation.newAggregation(Incoming.class, aggregationResult);
        List<DailySpendingsDTO> resultSR = mongoTemplate.aggregate(tempAgg, "incoming", DailySpendingsDTO.class).getMappedResults();
        List<DailySpendingsDTO> response = new ArrayList<>();
        resultSR.forEach(result -> {
            String id = result.get_id();
            Optional<SpendingCategory> category = categoryRepository.findById(id);
            if(category.isPresent()) {
                response.add(new DailySpendingsDTO(category.get().getCategory(), result.getTotal()));
            }
        });
        return ResponseEntity.ok(response);
    }
}
