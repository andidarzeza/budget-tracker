package com.adprod.inventar.models.utils;

import java.util.List;

public interface Subtractive<T> {
    List<T> subtract(List<T> a, List<T> b);
}
