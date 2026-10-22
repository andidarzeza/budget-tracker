package com.adprod.inventar.services;

import com.adprod.inventar.models.Transfer;
import org.springframework.http.ResponseEntity;

public interface TransferService {
    /** Move money between two sources in the same workspace. */
    ResponseEntity<?> save(Transfer transfer);
}
