package com.adprod.inventar.services;

import com.adprod.inventar.models.Incoming;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface IncomingService {
    ResponseEntity getIncomings(Pageable pageable);
    ResponseEntity addIncoming(Incoming incoming);
    ResponseEntity getIncomingObject(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(Incoming incoming);
}
