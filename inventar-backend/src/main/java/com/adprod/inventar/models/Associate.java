package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Document
public class Associate {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private long phoneNumber;
    private Instant registeredAt;
    private List<AssociateBookInfo> bookInfo = new ArrayList<>();
    public Associate() {
    }

    public Associate(String id, String firstName, String lastName, long phoneNumber, Instant registeredAt, List<AssociateBookInfo> bookInfo) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.registeredAt = registeredAt;
        this.bookInfo = bookInfo;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public long getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(long phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Instant registeredAt) {
        this.registeredAt = registeredAt;
    }

    public List<AssociateBookInfo> getBookInfo() {
        return bookInfo;
    }

    public void setBookInfo(List<AssociateBookInfo> bookInfo) {
        this.bookInfo = bookInfo;
    }

    public Associate addBookInfoToAssociate(String bookID, String bookTitle) {
        this.bookInfo.add(new AssociateBookInfo(bookID, bookTitle));
        return this;
    }
    public Associate removeBookFromAssociate(String bookId) {
        List<AssociateBookInfo> associateBookInfo = this.bookInfo.stream().filter(book -> book.getBookID().equals(bookId)).collect(Collectors.toList());
        if(!associateBookInfo.isEmpty()) {
            int index = this.bookInfo.indexOf(associateBookInfo.get(0));
                this.bookInfo.remove(index);
        }
        return this;
    }
}
