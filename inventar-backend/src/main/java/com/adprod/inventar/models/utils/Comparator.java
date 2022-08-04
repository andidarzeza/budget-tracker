package com.adprod.inventar.models.utils;

import org.springframework.stereotype.Service;
import java.lang.reflect.Field;

@Service
public class Comparator<T> implements Comparable<T>{
    @Override
    public boolean areEqual(T object1, T object2) {
        try {
            Field object1Field = object1.getClass().getDeclaredField("id");
            Field object2Field = object2.getClass().getDeclaredField("id");
            return object1Field.equals(object2Field);
        } catch (Exception e) {
            return false;
        }
    }
}
