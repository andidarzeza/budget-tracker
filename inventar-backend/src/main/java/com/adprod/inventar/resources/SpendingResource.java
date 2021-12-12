package com.adprod.inventar.resources;

import com.adprod.inventar.models.Account;
import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.Spending;
import com.adprod.inventar.services.AccountService;
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
    public ResponseEntity findAll(Pageable pageable){
        return spendingService.getSpendings(pageable);
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
    public ResponseEntity save(@RequestBody Spending spending){
        return spendingService.addSpending(spending);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Spending spending) {
        return spendingService.update(spending);
    }
}
