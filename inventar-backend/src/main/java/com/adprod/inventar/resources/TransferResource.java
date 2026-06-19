package com.adprod.inventar.resources;

import com.adprod.inventar.models.Transfer;
import com.adprod.inventar.services.TransferService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/transfers")
public class TransferResource {

    private final TransferService transferService;

    @GetMapping
    public ResponseEntity<?> findAll(@RequestParam String account) {
        return transferService.findAll(account);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Transfer transfer) {
        return transferService.save(transfer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return transferService.delete(id);
    }
}
