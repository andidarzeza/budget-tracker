package com.adprod.inventar.resources;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.services.ConfigurationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/configuration")
public class ConfigurationResource {

    private final ConfigurationService configurationService;

    @GetMapping
    public ResponseEntity getConfiguration() {
        return this.configurationService.getConfiguration();
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Configuration configuration) {
        return this.configurationService.update(configuration);
    }
}
