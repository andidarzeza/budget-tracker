package com.adprod.inventar.services;

import com.adprod.inventar.models.Associate;
import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.models.PrenotedBook;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface ConfigurationService {
    ResponseEntity updateConfiguration(Configuration configuration);
    ResponseEntity getConfiguration();
}
