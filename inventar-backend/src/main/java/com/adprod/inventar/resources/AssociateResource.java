package com.adprod.inventar.resources;

import com.adprod.inventar.models.Associate;
import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.PrenotedBook;
import com.adprod.inventar.services.AssociateService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/associate")
@CrossOrigin(origins = "http://localhost:4200")
public class AssociateResource {
    private final AssociateService associateService;

    public AssociateResource(AssociateService associateService) {
        this.associateService = associateService;
    }

    @GetMapping
    public ResponseEntity getAssociates(Pageable pageable) {
        return associateService.getAssociates(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity getAssociate(@PathVariable String id) {
        return associateService.getAssociate(id);
    }

    @GetMapping("/books/{id}")
    public ResponseEntity getAssociateBooks(@PathVariable String id) {
        return associateService.getAssociateBooks(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity removeAssociate(@PathVariable String id) {
        return associateService.removeAssociate(id);
    }

    @PostMapping
    public ResponseEntity addAssociate(@RequestBody Associate associate) {
        return associateService.addAssociate(associate);
    }
    @PutMapping
    public ResponseEntity updateAssociate(@RequestBody Associate associate) {
        return associateService.updateAssociate(associate);
    }
    @PostMapping("/add-book/{id}")
    public ResponseEntity addBookToAssociate(@PathVariable String id, @RequestBody Book book, @RequestParam String from, @RequestParam String to) {
        return associateService.addBookToAssociate(id, book, Instant.ofEpochMilli(Long.parseLong(from)), Instant.ofEpochMilli(Long.parseLong(to)));
    }

    @PostMapping("/remove-book/{id}")
    public ResponseEntity removeBookFromAssociate(@PathVariable String id, @RequestParam String deliveredOn, @RequestParam String bookId) {
        return associateService.removeBookFromAssociate(id, Instant.ofEpochMilli(Long.parseLong(deliveredOn)), bookId);
    }
}
