package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.models.wrappers.CategoryWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.services.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }


    @Override
    public ResponseEntity findAll(Pageable pageable) {
        Page<SpendingCategory> page = this.categoryRepository.findAll(pageable);
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
            return ResponseEntity.ok(new ResponseMessage("Category with id: " + id + " was deleted successfully."));
        }
        return new ResponseEntity(new ResponseMessage("No Category found for given id: " + id+ "."), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity save(SpendingCategory spendingCategory) {
        categoryRepository.save(spendingCategory);
        return ResponseEntity.ok(spendingCategory);
    }

    @Override
    public ResponseEntity update(SpendingCategory spendingCategory) {
        Optional<SpendingCategory> categoryOptional = categoryRepository.findById(spendingCategory.getId());
        if(categoryOptional.isPresent()) {
            categoryRepository.save(spendingCategory);
            return ResponseEntity.ok(spendingCategory);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
