package com.adprod.inventar.models;

import java.util.List;

public class AssociateWrapper {
    List<Associate> associates;
    long count;

    public List<Associate> getAssociates() {
        return associates;
    }

    public void setAssociates(List<Associate> associates) {
        this.associates = associates;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
