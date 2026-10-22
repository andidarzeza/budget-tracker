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

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Transfer transfer) {
        return transferService.save(transfer);
    }
}
