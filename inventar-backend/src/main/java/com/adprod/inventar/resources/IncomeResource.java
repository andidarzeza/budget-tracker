package com.adprod.inventar.resources;

import com.adprod.inventar.models.Income;
import com.adprod.inventar.services.IncomeService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/income")
public class IncomeResource {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam Map<String, String> params){
        return incomeService.findAll(pageable, params);
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
        return incomeService.save(income);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Income income, @PathVariable String id) {
        return incomeService.update(id, income);
    }
}
