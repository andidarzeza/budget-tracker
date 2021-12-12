package com.adprod.inventar.resources;

import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.utils.Comparator;
import com.adprod.inventar.models.utils.Subtractive;
import com.adprod.inventar.services.BookService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/book")
@CrossOrigin(origins = "http://localhost:4200")
public class BookResource {
    private final BookService bookService;
    private final Comparator<Book> bookComparator;
    private final Subtractive<Book> bookSubtractive;
    public BookResource(BookService bookService, Comparator<Book> bookComparator, Subtractive<Book> bookSubtractive) {
        this.bookService = bookService;
        this.bookComparator = bookComparator;
        this.bookSubtractive = bookSubtractive;
    }

    @GetMapping(value = "", produces = "application/json")
    public ResponseEntity getBooks(Pageable pageable){
        return bookService.getBooks(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity getBook(@PathVariable String id){
        return bookService.getBook(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity removeBook(@PathVariable String id){
        return bookService.removeBook(id);
    }

    @PostMapping
    public ResponseEntity addBook(@RequestBody Book book){
        return bookService.addBook(book);
    }

    @PutMapping
    public ResponseEntity updateBook(@RequestBody Book book) {
        return bookService.updateBook(book);
    }

    @GetMapping("/available/{id}")
    public ResponseEntity findAvailableAssociateBooks(@PathVariable String id) {
        return bookService.findAvailableAssociateBooks(id);
    }
}
