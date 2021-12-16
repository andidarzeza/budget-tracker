package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.SpendingCategory;
import java.util.List;

public class CategoryWrapper {
    List<SpendingCategory> categories;
    long count;

    public List<SpendingCategory> getCategories() {
        return categories;
    }

    public void setCategories(List<SpendingCategory> categories) {
        this.categories = categories;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
