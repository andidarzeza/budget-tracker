package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.ExpenseCategory;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CategoryWrapper {
    List<ExpenseCategory> categories;
    long count;
}
