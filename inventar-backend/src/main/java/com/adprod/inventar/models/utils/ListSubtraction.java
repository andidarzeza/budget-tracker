package com.adprod.inventar.models.utils;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

// Created By: Andi, date: 01/03/2021, 9:07 PM
// Offers the possibility to remove elements of a list from another list if they are the same type.
// The condition of whether the two objects are equal or not is totally dependent on the equals method of the T class
// which should be overridden to a custom implementation.
@Service
public class ListSubtraction<T> implements Subtractive<T> {
    @Override
    public List<T> subtract(List<T> a, List<T> b) {
        List<T> itemsToRemove = new ArrayList<>();
        a.forEach(aItem -> {
            b.forEach(bItem -> {
                if(bItem.equals(aItem)) {
                    itemsToRemove.add(aItem);
                    return;
                }
            });
        });
        a.removeAll(itemsToRemove);
        return a;
    }
}
