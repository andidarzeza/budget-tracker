package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document
public class PrenotedBook {
    @Id
    private String id;
    private String associateID;
    private Instant fromDate;
    private Instant toDate;
    private Instant deliveredDate;
    private Boolean isDelivered = false;
    private Book book;

    public PrenotedBook(String id, String associateID, Instant fromDate, Instant toDate, Instant deliveredDate, Book book) {
        this.id = id;
        this.associateID = associateID;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.deliveredDate = deliveredDate;
        this.book = book;
    }

    public PrenotedBook(String associateID, Book book, Instant fromDate, Instant toDate) {
        this.associateID = associateID;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.book = book;
    }

    public PrenotedBook() {
    }

    public Instant getFromDate() {
        return fromDate;
    }

    public void setFromDate(Instant fromDate) {
        this.fromDate = fromDate;
    }

    public Instant getToDate() {
        return toDate;
    }

    public void setToDate(Instant toDate) {
        this.toDate = toDate;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssociateID() {
        return associateID;
    }

    public void setAssociateID(String associateID) {
        this.associateID = associateID;
    }

    public Instant getDeliveredDate() {
        return deliveredDate;
    }

    public void setDeliveredDate(Instant deliveredDate) {
        this.deliveredDate = deliveredDate;
    }

    public Boolean getDelivered() {
        return isDelivered;
    }

    public void setDelivered(Boolean delivered) {
        isDelivered = delivered;
    }
}
