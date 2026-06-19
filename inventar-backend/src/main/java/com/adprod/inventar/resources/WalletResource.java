package com.adprod.inventar.resources;

import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.services.WalletService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/wallets")
public class WalletResource {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<?> findAll(@RequestParam String account) {
        return walletService.findAll(account);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Wallet wallet) {
        return walletService.save(wallet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Wallet wallet) {
        return walletService.update(id, wallet);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return walletService.delete(id);
    }
}
