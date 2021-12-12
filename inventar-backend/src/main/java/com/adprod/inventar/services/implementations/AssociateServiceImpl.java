package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.AssociatePointsRepository;
import com.adprod.inventar.repositories.AssociateRepository;
import com.adprod.inventar.repositories.BookRepository;
import com.adprod.inventar.repositories.PrenotedBookRepository;
import com.adprod.inventar.services.AssociateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssociateServiceImpl implements AssociateService {
    private final AssociateRepository associateRepository;
    private final BookRepository bookRepository;
    private final PrenotedBookRepository prenotedBookRepository;
    private final AssociatePointsRepository associatePointsRepository;

    public AssociateServiceImpl(AssociateRepository associateRepository, BookRepository bookRepository, PrenotedBookRepository prenotedBookRepository, AssociatePointsRepository associatePointsRepository) {
        this.associateRepository = associateRepository;
        this.bookRepository = bookRepository;
        this.prenotedBookRepository = prenotedBookRepository;
        this.associatePointsRepository = associatePointsRepository;
    }

    @Override
    public ResponseEntity getAssociates(Pageable pageable) {
        Page<Associate> page = this.associateRepository.findAll(pageable);
        AssociateWrapper associateWrapper = new AssociateWrapper();
        associateWrapper.setAssociates(page.getContent());
        associateWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(associateWrapper);
    }

    @Override
    public ResponseEntity getAssociate(String id) {
        Optional<Associate> associateOptional = associateRepository.findById(id);
        if(associateOptional.isPresent()) {
            return ResponseEntity.ok(associateOptional.get());
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity getAssociateBooks(String id) {
        List<PrenotedBook> prenotedBooks = prenotedBookRepository.findAllByAssociateID(id).stream().filter(prenotedBook -> !prenotedBook.getDelivered()).collect(Collectors.toList());
        return ResponseEntity.ok(prenotedBooks);
    }

    @Override
    public ResponseEntity removeAssociate(String id) {
        Optional<Associate> associateOptional = associateRepository.findById(id);
        if(associateOptional.isPresent()) {
            Associate associate = associateOptional.get();
            List<PrenotedBook> prenotedBooks = prenotedBookRepository.findAllByAssociateID(associate.getId());
            prenotedBookRepository.deleteAll(prenotedBooks);
            List<Book> books = prenotedBooks.stream().map(prenotedBook -> prenotedBook.getBook()).collect(Collectors.toList());
            List<Book> booksToBeSaved = new ArrayList<>();
            books.forEach(book -> {
                Book book1 = bookRepository.findById(book.getId()).get();
                book1.setStock(book1.getStock() + 1);
                booksToBeSaved.add(book1);
            });
            bookRepository.saveAll(booksToBeSaved);
            associateRepository.delete(associate);
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity addAssociate(Associate associate) {
        associateRepository.save(associate);
        AssociatePoints associatePoints = new AssociatePoints();
        associatePoints.setAssociateID(associate.getId());
        associatePoints.setFirstName(associate.getFirstName());
        associatePoints.setLastName(associate.getLastName());
        associatePointsRepository.save(associatePoints);
        return ResponseEntity.ok(new ResponseMessage("Success"));
    }

    @Override
    public ResponseEntity updateAssociate(Associate associate) {
        Optional<Associate> associateOptional = associateRepository.findById(associate.getId());
        if(associateOptional.isPresent()) {
            associateRepository.save(associate);
            return ResponseEntity.ok(associate);
        } else {
            return new ResponseEntity(new ResponseMessage("Associate Not Found!"), HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity addBookToAssociate(String id, Book book, Instant from, Instant to) {
        Optional<Associate> associateOptional = associateRepository.findById(id);
        if(associateOptional.isPresent()) {
            Associate associate = associateOptional.get();
            PrenotedBook prenotedBook = new PrenotedBook(id, book, from, to);
            associate.addBookInfoToAssociate(book.getId(), book.getTitle());
            associateRepository.save(associate);
            prenotedBookRepository.save(prenotedBook);
            book.setStock(book.getStock() - 1);
            this.bookRepository.save(book);
            return ResponseEntity.ok(associateOptional.get());
        }
        return ResponseEntity.ok(new ResponseMessage("Something wrong went.Could not add book."));
    }

    @Override
    public ResponseEntity removeBookFromAssociate(String id, Instant deliveredOn, String bookID) {
        Optional<Associate> associateOptional = associateRepository.findById(id);
        if(associateOptional.isPresent()) {
            Associate associate = associateOptional.get();
            PrenotedBook prenotedBook = prenotedBookRepository.findByAssociateIDAndId(id, bookID);
            prenotedBook.setDeliveredDate(deliveredOn);
            prenotedBook.setDelivered(true);
            associate = associate.removeBookFromAssociate(prenotedBook.getBook().getId());
            Optional<AssociatePoints> associatePointsOptional = associatePointsRepository.findByAssociateID(associate.getId());
            if(associatePointsOptional.isPresent()) {
                AssociatePoints associatePoints = associatePointsOptional.get();
                associatePoints.setNumberOfBooksRead(associatePoints.getNumberOfBooksRead() + 1);
                associatePointsRepository.save(associatePoints);
            }
            Book book = bookRepository.findById(prenotedBook.getBook().getId()).get();
            book.setStock(book.getStock() + 1);
            bookRepository.save(book);
            associateRepository.save(associate);
            prenotedBookRepository.save(prenotedBook);
            return ResponseEntity.ok(associate);
        }
        return ResponseEntity.ok(new ResponseMessage("Something wrong went.Could not remove book."));
    }
}
