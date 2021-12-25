package com.adprod.inventar.services;

import com.adprod.inventar.models.Configuration;
import org.springframework.http.ResponseEntity;

public interface ConfigurationService {
    ResponseEntity update(Configuration configuration);
    ResponseEntity getConfiguration(String user);
}
