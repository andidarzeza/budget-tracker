package com.adprod.inventar.resources;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.services.ConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuration")
public class ConfigurationResource {
    private final ConfigurationService configurationService;

    public ConfigurationResource(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping
    public ResponseEntity getConfiguration() {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return this.configurationService.getConfiguration(user);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Configuration configuration) {
        return this.configurationService.update(configuration);
    }
}
