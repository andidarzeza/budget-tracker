package com.adprod.inventar.resources;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.services.ConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuration")
@CrossOrigin(origins = "http://localhost:4200")
public class ConfigurationResource {
    private final ConfigurationService configurationService;

    public ConfigurationResource(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping
    public ResponseEntity getConfiguration() {
        return this.configurationService.getConfiguration();
    }

    @PutMapping
    public ResponseEntity updateConfiguration(@RequestBody Configuration configuration) {
        return this.configurationService.updateConfiguration(configuration);
    }

}
