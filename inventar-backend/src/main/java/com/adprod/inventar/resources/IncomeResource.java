package com.adprod.inventar.resources;

import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.services.IncomeService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incomes")
public class IncomeResource {
    private final IncomeService incomeService;

    public IncomeResource(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return incomeService.findAll(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return incomeService.findOne(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return incomeService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Incoming incoming){
        return incomeService.save(incoming);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Incoming income, @PathVariable String id) {
        return incomeService.update(id, income);
    }
}
