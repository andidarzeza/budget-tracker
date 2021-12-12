package com.adprod.inventar.services;

import com.adprod.inventar.models.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

public interface BookService {
    ResponseEntity getBooks(Pageable pageable);
    ResponseEntity getBook(String id);
    ResponseEntity removeBook(String id);
    ResponseEntity addBook(@RequestBody Book book);
    ResponseEntity updateBook(@RequestBody Book book);
    ResponseEntity findAvailableAssociateBooks(String id);
}
