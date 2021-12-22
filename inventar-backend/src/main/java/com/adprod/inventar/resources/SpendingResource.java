package com.adprod.inventar.resources;

import com.adprod.inventar.models.Spending;
import com.adprod.inventar.services.SpendingService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/spending")
@CrossOrigin(origins = "http://localhost:4200")
public class SpendingResource {
    private final SpendingService spendingService;

    public SpendingResource(SpendingService spendingService) {
        this.spendingService = spendingService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return spendingService.getExpenses(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return spendingService.getSpendObject(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return spendingService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Spending expense){
        return spendingService.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Spending expense, @PathVariable String id) {
        return spendingService.update(id, expense);
    }
}
