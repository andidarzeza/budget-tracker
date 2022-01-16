package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.SpendingCategory;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CategoryWrapper {
    List<SpendingCategory> categories;
    long count;
}
