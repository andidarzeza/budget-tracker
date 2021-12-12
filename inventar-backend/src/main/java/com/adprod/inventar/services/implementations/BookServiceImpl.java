package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.models.utils.Subtractive;
import com.adprod.inventar.repositories.AssociateRepository;
import com.adprod.inventar.repositories.BookRepository;
import com.adprod.inventar.repositories.PrenotedBookRepository;
import com.adprod.inventar.services.AssociateService;
import com.adprod.inventar.services.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;
    private final AssociateRepository associateRepository;
    private final AssociateService associateService;
    private final PrenotedBookRepository prenotedBookRepository;
    private final Subtractive<Book> bookSubtractive;
    public BookServiceImpl(BookRepository bookRepository, AssociateRepository associateRepository, AssociateService associateService, PrenotedBookRepository prenotedBookRepository, Subtractive<Book> bookSubtractive) {
        this.bookRepository = bookRepository;
        this.associateRepository = associateRepository;
        this.associateService = associateService;
        this.prenotedBookRepository = prenotedBookRepository;
        this.bookSubtractive = bookSubtractive;
    }

    @Override
    public ResponseEntity getBooks(Pageable pageable) {
        Page<Book> page = this.bookRepository.findAll(pageable);
        BookWrapper bookWrapper = new BookWrapper();
        bookWrapper.setBooks(page.getContent());
        bookWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(bookWrapper);
    }

    @Override
    public ResponseEntity getBook(String id) {
        return ResponseEntity.ok(bookRepository.findById(id));
    }

    @Override
    public ResponseEntity removeBook(String id) {
        Optional<Book> book = bookRepository.findById(id);
        if(book.isPresent()) {
            bookRepository.delete(book.get());
            this.deleteBooksFromUsers(book.get());
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity addBook(Book book) {
        bookRepository.save(book);
        return ResponseEntity.ok(new ResponseMessage("Success"));
    }

    @Override
    public ResponseEntity updateBook(Book book) {
        Optional<Book> bookOptional = bookRepository.findById(book.getId());
        if(bookOptional.isPresent()) {
            bookRepository.save(book);
            updateAllAssignedBooksToUsers(book);
            return ResponseEntity.ok(new ResponseMessage("Success"));
        } else {
            return new ResponseEntity(new ResponseMessage("Book Not Found!"), HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity findAvailableAssociateBooks(String id) {
        Optional<Associate> associateOptional = associateRepository.findById(id);
        if(associateOptional.isPresent()) {
            List<Book> associateBooks = this.prenotedBookRepository.findAllByAssociateID(id).stream().filter(prenotedBook -> !prenotedBook.getDelivered()).map(prenotedBook -> prenotedBook.getBook()).collect(Collectors.toList());
            List<Book> allBooks = this.bookRepository.findAll().stream().filter(book -> book.getStock() != 0).collect(Collectors.toList());
            return ResponseEntity.ok(this.bookSubtractive.subtract(allBooks, associateBooks));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    boolean contains(List<Book> list, Book book) {
        AtomicBoolean flag = new AtomicBoolean(false);
        list.forEach(book1 -> {
            if(book1.getId().equals(book.getId())) {
                flag.set(true);
                return;
            }
        });
        return flag.get();
    }

    private void updateAllAssignedBooksToUsers(Book book) {
        List<Associate> associates = associateRepository.findAll();
        associates.forEach(associate -> {
            this.updateAssociateBook(associate, book);
        });
    }

    private void updateAssociateBook(Associate associate, Book book1) {
//        associate.getBooks().forEach(book -> {
//            this.updateBook(associate, book, book1);
//        });
    }

    private void updateBook(Associate associate, PrenotedBook prenotedBook, Book book1) {
//        if(prenotedBook.getBook().getId().equals(book1.getId())) {
//            prenotedBook.setBook(book1);
//            associate.setBooks(associate.updateBook(book1.getId(), prenotedBook));
//            associateRepository.save(associate);
//        }
    }

    private void deleteBooksFromUsers(Book book) {
        List<Associate> associates = this.associateRepository.findAll();
        associates.forEach(associate -> {
            removeBookFromAssociate(associate, book);
        });
    }
    private void removeBookFromAssociate(Associate associate, Book book) {
        List<AssociateBookInfo> bookInfos = new ArrayList<>();
        associate.getBookInfo().forEach(bookInfo-> {
            if(bookInfo.getBookID().equals(book.getId())) {
                Optional<PrenotedBook> prenotedBook = this.prenotedBookRepository.findByAssociateIDAndBookId(associate.getId(), book.getId());
                bookInfos.add(bookInfo);
                if(prenotedBook.isPresent()) {
                    this.prenotedBookRepository.delete(prenotedBook.get());
                }
            }
        });
        bookInfos.forEach(bookInf -> {
            associate.getBookInfo().remove(bookInf);
        });
        associateRepository.save(associate);
    }
}
