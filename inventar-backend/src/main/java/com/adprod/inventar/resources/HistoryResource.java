package com.adprod.inventar.resources;

import com.adprod.inventar.services.HistoryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/history")
public class HistoryResource {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity findAll(Pageable pageable, @RequestParam Map<String, String> params){
        return historyService.findAll(pageable, params);
    }

    @GetMapping("/{id}")
    public ResponseEntity findOne(@PathVariable String id){
        return historyService.findOne(id);
    }

}
