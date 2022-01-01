package com.adprod.inventar.resources;

import com.adprod.inventar.models.SpendingCategory;
import com.adprod.inventar.services.CategoryService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryResource {
    private final CategoryService categoryService;

    public CategoryResource(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping(value = "", produces = "application/json")
    public ResponseEntity findAll(Pageable pageable, @RequestParam String categoryType){
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return categoryService.findAll(pageable, categoryType, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return categoryService.findOne(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return categoryService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody SpendingCategory spendingCategory){
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        spendingCategory.setUser(user);
        return categoryService.save(spendingCategory);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody SpendingCategory spendingCategory) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        spendingCategory.setUser(user);
        return categoryService.update(spendingCategory);
    }
}
