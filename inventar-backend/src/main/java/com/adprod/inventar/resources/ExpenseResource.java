package com.adprod.inventar.resources;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.services.ExpenseService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/spending")
public class ExpenseResource {
    private final ExpenseService expenseService;

    public ExpenseResource(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable){
        return expenseService.getExpenses(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return ResponseEntity.ok(expenseService.findOne(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return expenseService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Expense expense){
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        expense.setUser(user);
        return expenseService.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Expense expense, @PathVariable String id) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        expense.setUser(user);
        return expenseService.update(id, expense);
    }
}
