package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** App-wide search: the latest matching expenses and incomes. */
@Getter
@AllArgsConstructor
public class SearchResultDTO {
    private List<SearchHitDTO> expenses;
    private List<SearchHitDTO> incomes;
}
