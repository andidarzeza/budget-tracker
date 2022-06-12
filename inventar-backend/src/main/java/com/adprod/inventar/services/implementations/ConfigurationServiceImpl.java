package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.repositories.ConfigurationRepository;
import com.adprod.inventar.services.ConfigurationService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ConfigurationServiceImpl implements ConfigurationService {

    private final ConfigurationRepository configurationRepository;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity update(Configuration configuration) {
        String user = securityContextService.username();
        Configuration configurationDB = configurationRepository
                .findByUser(user)
                .orElseThrow(
                        () -> new NotFoundException("Configuration for user: " + user + " was not found!")
                );
        configuration.setId(configurationDB.getId());
        configuration.setUser(user);
        configurationRepository.save(configuration);
        return ResponseEntity.ok(configuration);
    }

    @Override
    public Configuration save(Configuration configuration) {
        return configurationRepository.save(configuration);
    }

    @Override
    public ResponseEntity getConfiguration() {
        return ResponseEntity.ok(
                configurationRepository
                    .findByUser(securityContextService.username())
                    .orElseGet(
                        () -> new Configuration(null, false, true, null)
                    )
        );
    }
}
