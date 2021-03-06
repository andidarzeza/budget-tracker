package com.adprod.inventar.resources;

import com.adprod.inventar.models.ExpenseCategory;
import com.adprod.inventar.services.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/categories")
public class CategoryResource {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam Map<String, String> params) {
        return categoryService.findAll(pageable, params);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return ResponseEntity.ok(categoryService.findOne(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return categoryService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody ExpenseCategory expenseCategory) {
        return categoryService.save(expenseCategory);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody ExpenseCategory expenseCategory) {
        return categoryService.update(expenseCategory);
    }
}
