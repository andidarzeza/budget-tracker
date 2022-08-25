package com.adprod.inventar.services;

import com.adprod.inventar.models.History;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

public interface HistoryService {
    
    ResponseEntity findAll(Pageable pageable, Map<String, String> params);

    ResponseEntity findOne(String id);

    History from(EntityAction action, EntityType entity, String account);

    void save(History history);

}
