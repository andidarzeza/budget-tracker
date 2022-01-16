package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.CategoryWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.services.CategoryService;
import com.adprod.inventar.services.HistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final HistoryService historyService;
    private final EntityType entityType = EntityType.CATEGORY;

    public CategoryServiceImpl(CategoryRepository categoryRepository, HistoryService historyService) {
        this.categoryRepository = categoryRepository;
        this.historyService = historyService;
    }

    @Override
    public ResponseEntity findAll(Pageable pageable, String categoryType, String user) {
        Page<SpendingCategory> page = this.categoryRepository.findAllByCategoryTypeAndUser(pageable, categoryType, user);
        CategoryWrapper categoryWrapper = new CategoryWrapper();
        categoryWrapper.setCategories(page.getContent());
        categoryWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(categoryWrapper);
    }

    @Override
    public ResponseEntity findOne(String id) {
        Optional<SpendingCategory> categoryOptional = categoryRepository.findById(id);
        if(categoryOptional.isPresent()) {
            return ResponseEntity.ok(categoryOptional.get());
        }
        return new ResponseEntity(new ResponseMessage("No Category found for given id: " + id+ "."), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity delete(String id) {
        Optional<SpendingCategory> categoryOptional = categoryRepository.findById(id);
        if(categoryOptional.isPresent()) {
            categoryRepository.delete(categoryOptional.get());
            historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
            return ResponseEntity.ok(new ResponseMessage("Category with id: " + id + " was deleted successfully."));
        }
        return new ResponseEntity(new ResponseMessage("No Category found for given id: " + id+ "."), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity save(SpendingCategory spendingCategory) {
        categoryRepository.save(spendingCategory);
        historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
        return ResponseEntity.ok(spendingCategory);
    }

    @Override
    public ResponseEntity update(SpendingCategory spendingCategory) {
        Optional<SpendingCategory> categoryOptional = categoryRepository.findById(spendingCategory.getId());
        if(categoryOptional.isPresent()) {
            spendingCategory.setLastModifiedDate(new Date());
            categoryRepository.save(spendingCategory);
            historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
            return ResponseEntity.ok(spendingCategory);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
