package com.adprod.inventar.resources;

import com.adprod.inventar.models.Category;
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
        return categoryService.findOne(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return categoryService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Category category) {
        return categoryService.save(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@PathVariable String id, @RequestBody Category category) {
        return categoryService.update(id, category);
    }
}
