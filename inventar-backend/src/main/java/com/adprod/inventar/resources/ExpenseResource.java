package com.adprod.inventar.resources;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/spending")
public class ExpenseResource {

    private final ExpenseService expenseService;
    private final SecurityContextService securityContextService;

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
        expense.setUser(securityContextService.username());
        return expenseService.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Expense expense, @PathVariable String id) {
        expense.setUser(securityContextService.username());
        return expenseService.update(id, expense);
    }
}
