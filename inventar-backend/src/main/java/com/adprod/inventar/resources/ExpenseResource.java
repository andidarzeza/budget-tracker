package com.adprod.inventar.resources;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/spending")
public class ExpenseResource {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam Map<String, String> params){
        return expenseService.getExpenses(pageable, params);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return expenseService.findOne(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return expenseService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Expense expense){
        return expenseService.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Expense expense, @PathVariable String id) {
        return expenseService.update(id, expense);
    }
}
