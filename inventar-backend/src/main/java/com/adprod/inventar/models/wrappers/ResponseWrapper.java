package com.adprod.inventar.models.wrappers;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ResponseWrapper<E> {
    List<E> data;
    long count;
}
