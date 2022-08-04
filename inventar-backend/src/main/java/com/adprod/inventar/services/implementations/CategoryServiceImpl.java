package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.*;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.services.CategoryService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final SecurityContextService securityContextService;
    private final CategoryRepository categoryRepository;
    private final HistoryService historyService;
    private final EntityType entityType = CATEGORY;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        String category = params.get("category");
        String description = params.get("description");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QCategory.category1.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QCategory.category1.categoryType.eq(params.get("categoryType")));
        if(Objects.nonNull(description)) {
            booleanBuilder = booleanBuilder.and(QCategory.category1.description.containsIgnoreCase(description));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QCategory.category1.category.containsIgnoreCase(category));
        }
        Page<Category> page = this.categoryRepository.findAll(booleanBuilder, pageable);
        ResponseWrapper<Category> categoryWrapper = new ResponseWrapper();
        categoryWrapper.setData(page.getContent());
        categoryWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(categoryWrapper);
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
        categoryRepository.deleteById(id);
        historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
        return ResponseEntity.ok(new ResponseMessage("Category with id: " + id + " was deleted successfully."));
    }

    @Override
    public ResponseEntity save(Category category) {
        category.setUser(securityContextService.username());
        categoryRepository.save(category);
        historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
        return ResponseEntity.ok(category);
    }

    @Override
    public ResponseEntity update(String id, Category category) {
        category.setUser(securityContextService.username());
        category.setLastModifiedDate(LocalDateTime.now());
        category.setId(id);
        categoryRepository.save(category);
        historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
        return ResponseEntity.ok(category);
    }
}
