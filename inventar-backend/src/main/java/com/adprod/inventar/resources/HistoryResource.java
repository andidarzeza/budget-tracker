package com.adprod.inventar.resources;

import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/history")
public class HistoryResource {

    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable){
        return historyService.findAll(pageable, securityContextService.username());
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return historyService.findOne(id);
    }

}
