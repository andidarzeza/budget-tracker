package com.adprod.inventar.models.wrappers;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SpendingWrapper {
    List<SpendingDTO> expenses;
    long count;
}
