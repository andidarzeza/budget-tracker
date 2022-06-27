package com.adprod.inventar.resources;

import com.adprod.inventar.models.Income;
import com.adprod.inventar.services.IncomeService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/incomes")
public class IncomeResource {

    private final IncomeService incomeService;
    private final SecurityContextService securityContextService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable){
        return incomeService.findAll(pageable, securityContextService.username());
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
        income.setUser(securityContextService.username());
        return incomeService.save(income);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Income income, @PathVariable String id) {
        income.setUser(securityContextService.username());
        return incomeService.update(id, income);
    }
}
