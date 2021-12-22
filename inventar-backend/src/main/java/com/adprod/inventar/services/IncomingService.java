package com.adprod.inventar.services;

import com.adprod.inventar.models.Incoming;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface IncomingService {
    ResponseEntity getIncomes(Pageable pageable, String user);
    ResponseEntity addIncoming(Incoming incomeincoming);
    ResponseEntity getIncomingObject(String id);
    ResponseEntity delete(String id);
    ResponseEntity update(String id, Incoming income);
}
