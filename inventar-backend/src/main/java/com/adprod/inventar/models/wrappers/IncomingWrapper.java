package com.adprod.inventar.models.wrappers;

import java.util.List;

public class IncomingWrapper {
    List<IncomingDTO> incomings;
    long count;

    public List<IncomingDTO> getIncomings() {
        return incomings;
    }

    public void setIncomings(List<IncomingDTO> incomings) {
        this.incomings = incomings;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
