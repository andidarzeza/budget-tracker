package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class AssociatePoints {
    @Id
    private String id;
    private String associateID;
    private String firstName;
    private String lastName;
    private Integer numberOfBooksRead = 0;

    public AssociatePoints() {
    }

    public AssociatePoints(String id, String associateID, String firstName, String lastName, Integer numberOfBooksRead) {
        this.id = id;
        this.associateID = associateID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.numberOfBooksRead = numberOfBooksRead;
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

    public Integer getNumberOfBooksRead() {
        return numberOfBooksRead;
    }

    public void setNumberOfBooksRead(Integer numberOfBooksRead) {
        this.numberOfBooksRead = numberOfBooksRead;
    }
}
