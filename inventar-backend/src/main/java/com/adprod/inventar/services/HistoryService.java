package com.adprod.inventar.services;

import com.adprod.inventar.models.History;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface HistoryService {

    ResponseEntity findAll(Pageable pageable, Map<String, String> params);

    /** Save an entry (see {@link History#of}) for the current user. */
    void record(History history);

    /** Names for ids in summaries and changes; null when the record is gone. */
    String categoryName(String categoryId);

    String sourceName(String walletId);

    String projectName(String projectId);

}
