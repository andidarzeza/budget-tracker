package com.adprod.inventar.resources;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.services.ConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuration")
public class ConfigurationResource {
    private final ConfigurationService configurationService;

    public ConfigurationResource(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping
    public ResponseEntity getConfiguration(@RequestParam(required = false) String user) {
        return this.configurationService.getConfiguration(user);
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Configuration configuration) {
        return this.configurationService.update(configuration);
    }
}
