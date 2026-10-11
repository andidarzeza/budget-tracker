package com.adprod.inventar.services;

import com.adprod.inventar.models.SearchResultDTO;

public interface SearchService {
    /** Expenses and incomes whose description, category name or amount matches `query`. */
    SearchResultDTO search(String account, String query, int limit);
}
