package com.adprod.inventar.resources;

import com.adprod.inventar.models.Spending;
import com.adprod.inventar.services.ExpenseService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/spending")
public class ExpenseResource {
    private final ExpenseService expenseService;

    public ExpenseResource(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return expenseService.getExpenses(pageable, user);
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
    public ResponseEntity save(@RequestBody Spending expense){
        return expenseService.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Spending expense, @PathVariable String id) {
        return expenseService.update(id, expense);
    }
}
