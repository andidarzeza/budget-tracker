package com.adprod.inventar.models;

import java.util.List;

public class BookWrapper {
    List<Book> books;
    long count;

    public List<Book> getBooks() {
        return books;
    }

    public void setBooks(List<Book> books) {
        this.books = books;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }


}
