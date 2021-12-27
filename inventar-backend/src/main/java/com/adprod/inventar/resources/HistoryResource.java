package com.adprod.inventar.resources;

import com.adprod.inventar.services.HistoryService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history")
public class HistoryResource {
    private final HistoryService historyService;

    public HistoryResource(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping(value = "", produces = "application/json")
    public ResponseEntity findAll(Pageable pageable, @RequestParam String user){
        return historyService.findAll(pageable, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return historyService.findOne(id);
    }

}
