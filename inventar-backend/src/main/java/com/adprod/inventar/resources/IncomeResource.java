package com.adprod.inventar.resources;

import com.adprod.inventar.models.Income;
import com.adprod.inventar.services.IncomeService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incomes")
public class IncomeResource {
    private final IncomeService incomeService;

    public IncomeResource(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable){
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return incomeService.findAll(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return ResponseEntity.ok(incomeService.findOne(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return incomeService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Income income){
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        income.setUser(user);
        return incomeService.save(income);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Income income, @PathVariable String id) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        income.setUser(user);
        return incomeService.update(id, income);
    }
}
