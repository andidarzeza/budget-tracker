package com.adprod.inventar.resources;

import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.services.IncomingService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incomings")
@CrossOrigin(origins = "http://localhost:4200")
public class IncomingResource {
    private final IncomingService incomingService;

    public IncomingResource(IncomingService incomingService) {
        this.incomingService = incomingService;
    }

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return incomingService.getIncomes(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return incomingService.getIncomingObject(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable String id){
        return incomingService.delete(id);
    }

    @PostMapping
    public ResponseEntity save(@RequestBody Incoming incoming){
        return incomingService.addIncoming(incoming);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Incoming incoming) {
        return incomingService.update(incoming);
    }
}
