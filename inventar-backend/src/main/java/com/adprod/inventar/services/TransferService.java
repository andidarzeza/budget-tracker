package com.adprod.inventar.services;

import com.adprod.inventar.models.Transfer;
import org.springframework.http.ResponseEntity;

public interface TransferService {
    /** Move money between two sources in the same workspace. */
    ResponseEntity<?> save(Transfer transfer);
    /** Transfers for a workspace, newest first. */
    ResponseEntity<?> findAll(String account);
    /** Reverse and remove a transfer (refund the source, pull back from the destination). */
    ResponseEntity<?> delete(String id);
}
