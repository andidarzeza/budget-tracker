package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.Spending;
import com.adprod.inventar.models.SpendingCategory;

import java.util.List;

public class SpendingWrapper {
    List<SpendingDTO> spendings;
    long count;

    public List<SpendingDTO> getSpendings() {
        return spendings;
    }

    public void setSpendings(List<SpendingDTO> spendings) {
        this.spendings = spendings;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
