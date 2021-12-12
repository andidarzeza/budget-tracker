package com.adprod.inventar.services;

import com.adprod.inventar.models.Associate;
import com.adprod.inventar.models.Book;
import com.adprod.inventar.models.PrenotedBook;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

public interface AssociateService {
    ResponseEntity getAssociates(Pageable pageable);
    ResponseEntity getAssociate(String id);
    ResponseEntity getAssociateBooks(String id);
    ResponseEntity removeAssociate(String id);
    ResponseEntity addAssociate(Associate associate);
    ResponseEntity updateAssociate(Associate associate);
    ResponseEntity addBookToAssociate(String id, Book book, Instant from, Instant to);
    ResponseEntity removeBookFromAssociate(String id, Instant deliveredOn, String bookID);

}
