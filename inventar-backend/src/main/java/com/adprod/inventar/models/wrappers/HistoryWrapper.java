package com.adprod.inventar.models.wrappers;

import com.adprod.inventar.models.History;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class HistoryWrapper {
    List<History> historyList;
    long count;
}
