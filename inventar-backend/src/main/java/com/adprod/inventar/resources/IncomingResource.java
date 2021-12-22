package com.adprod.inventar.resources;

import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.services.IncomingService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incomes")
@CrossOrigin(origins = "http://localhost:4200")
public class IncomingResource {
    private final IncomingService incomingService;

    public IncomingResource(IncomingService incomingService) {
        this.incomingService = incomingService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return incomingService.findAll(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return incomingService.findOne(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return incomingService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Incoming incoming){
        return incomingService.save(incoming);
    }

    @PutMapping("/{id}")
    public ResponseEntity update(@RequestBody Incoming income, @PathVariable String id) {
        return incomingService.update(id, income);
    }
}
