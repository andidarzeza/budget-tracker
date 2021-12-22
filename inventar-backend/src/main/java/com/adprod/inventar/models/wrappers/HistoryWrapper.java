package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.History;
import com.adprod.inventar.models.SpendingCategory;

import java.util.List;

public class HistoryWrapper {
    List<History> historyList;
    long count;

    public List<History> getHistoryList() {
        return historyList;
    }

    public void setHistoryList(List<History> historyList) {
        this.historyList = historyList;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
