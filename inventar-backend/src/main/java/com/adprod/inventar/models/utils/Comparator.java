package com.adprod.inventar.models.utils;

import org.springframework.stereotype.Service;

import java.lang.reflect.Field;

@Service
public class Comparator<T> implements Comparable<T>{
    @Override
    public boolean areEqual(T object1, T object2) {
        Class<?> object1Class = object1.getClass();
        Class<?> object2Class = object2.getClass();
        try {
            Field object1Field = object1Class.getDeclaredField("id");
            Field object2Field = object2Class.getDeclaredField("id");
            if(object1Field.equals(object2Field))  {
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
