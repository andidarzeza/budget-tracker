package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.*;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.CategoryService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final SecurityContextService securityContextService;
    private final CategoryRepository categoryRepository;
    private final HistoryService historyService;
    private final EntityType entityType = CATEGORY;
    private final AccountService accountService;
    private final MongoTemplate mongoTemplate;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        String category = params.get("category");
        String description = params.get("description");
        String categoryType = params.get("categoryType");
        BooleanBuilder booleanBuilder = new BooleanBuilder()
                .and(QCategory.category1.user.eq(securityContextService.username()))
                .and(QCategory.category1.account.eq(params.get("account")))
                .and(QCategory.category1.description.containsIgnoreCase(Objects.nonNull(description) ? description : ""))
                .and(QCategory.category1.category.containsIgnoreCase(Objects.nonNull(category) ? category : ""));

        // Optional — only narrow by INCOME/EXPENSE when the caller explicitly
        // asked for it; the Categories page itself wants every type.
        if (Objects.nonNull(categoryType) && !categoryType.isEmpty()) {
            booleanBuilder.and(QCategory.category1.categoryType.eq(categoryType));
        }

        Page<Category> page = this.categoryRepository.findAll(booleanBuilder, pageable);
        ResponseWrapper<Category> categoryWrapper = new ResponseWrapper();
        categoryWrapper.setData(page.getContent());
        categoryWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(categoryWrapper);
    }

    @Override
    public ResponseEntity findByUsage(String account, String categoryType) {
        String username = securityContextService.username();
        Map<String, Long> usageById = countCategoryUsage(username, account, categoryType);

        BooleanBuilder filter = new BooleanBuilder()
                .and(QCategory.category1.user.eq(username))
                .and(QCategory.category1.account.eq(account));
        if (categoryType != null && !categoryType.isEmpty()) {
            filter.and(QCategory.category1.categoryType.eq(categoryType));
        }

        List<Category> categories = new ArrayList<>();
        categoryRepository.findAll(filter).forEach(categories::add);

        // Most used first; ties broken alphabetically so ordering is stable for the picker.
        categories.sort((a, b) -> {
            long ca = usageById.getOrDefault(a.getId(), 0L);
            long cb = usageById.getOrDefault(b.getId(), 0L);
            if (ca != cb) {
                return Long.compare(cb, ca);
            }
            String na = a.getCategory() != null ? a.getCategory() : "";
            String nb = b.getCategory() != null ? b.getCategory() : "";
            return na.compareToIgnoreCase(nb);
        });

        return ResponseEntity.ok(categories);
    }

    /**
     * Count how many expenses (or incomes) reference each {@code categoryID} for the current
     * user / account. Empty map when the collection has no matching rows.
     */
    private Map<String, Long> countCategoryUsage(String username, String account, String categoryType) {
        String collection = "INCOME".equalsIgnoreCase(categoryType) ? "incomes" : "spending";
        AggregationOperation match = Aggregation.match(
                Criteria.where("user").is(username).and("account").is(account));
        AggregationOperation group = Aggregation.group("categoryID").count().as("count");

        Aggregation agg = Aggregation.newAggregation(match, group);
        AggregationResults<Document> results = mongoTemplate.aggregate(agg, collection, Document.class);

        Map<String, Long> counts = new HashMap<>();
        for (Document doc : results.getMappedResults()) {
            Object id = doc.get("_id");
            Object count = doc.get("count");
            if (id != null && count instanceof Number) {
                counts.put(String.valueOf(id), ((Number) count).longValue());
            }
        }
        return counts;
    }

    @Override
    public ResponseEntity findOne(String id) {
        Category category = categoryRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense Category with id: " + id + " was not found!")
                );
        return ResponseEntity.ok(category);
    }

    @Override
    public ResponseEntity delete(String id) {
        return categoryRepository
                .findById(id)
                .map(category -> {
                    categoryRepository.deleteById(id);
                    historyService.save(historyService.from(EntityAction.DELETE, entityType, category.getAccount()));
                    return ResponseEntity.ok(new ResponseMessage("Category with id: " + id + " was deleted successfully."));
                })
                .orElseThrow(() -> new NotFoundException("No category found with id: " + id));

    }

    @Override
    public ResponseEntity save(Category category) {
        accountService.checkAccount(category.getAccount());
        category.setUser(securityContextService.username());
        categoryRepository.save(category);
        historyService.save(historyService.from(EntityAction.CREATE, entityType, category.getAccount()));
        return ResponseEntity.ok(category);
    }

    @Override
    public ResponseEntity update(String id, Category category) {
        accountService.checkAccount(category.getAccount());
        category.setUser(securityContextService.username());
        category.setLastModifiedDate(LocalDateTime.now());
        category.setId(id);
        categoryRepository.save(category);
        historyService.save(historyService.from(EntityAction.UPDATE, entityType, category.getAccount()));
        return ResponseEntity.ok(category);
    }
}
