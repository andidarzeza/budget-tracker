package com.adprod.inventar.resources;

import com.adprod.inventar.models.SearchResultDTO;
import com.adprod.inventar.services.SearchService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/search")
public class SearchResource {

    private final SearchService searchService;

    /** App-wide search (the sidebar's Spotlight): latest matching expenses and incomes. */
    @GetMapping
    public ResponseEntity<SearchResultDTO> search(@RequestParam String account, @RequestParam String q,
                                                  @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(searchService.search(account, q, Math.min(Math.max(limit, 1), 20)));
    }
}
