package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Book {
    @Id
    private String id;
    private String title;
    private String author;
    private int year;
    private int stock;
    private int numberOfPages;

    public Book(String id, String title, String author, int year, int stock, int numberOfPages) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.stock = stock;
        this.numberOfPages = numberOfPages;
    }

    public Book() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public int getNumberOfPages() {
        return numberOfPages;
    }

    public void setNumberOfPages(int numberOfPages) {
        this.numberOfPages = numberOfPages;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    @Override
    public boolean equals(Object obj) {
        if(obj instanceof Book) {
            return this.id.equals(((Book) obj).id);
        } else {
            return this == obj;
        }
    }
}
