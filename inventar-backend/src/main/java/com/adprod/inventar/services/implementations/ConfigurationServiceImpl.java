package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.repositories.ConfigurationRepository;
import com.adprod.inventar.services.ConfigurationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Objects;
import java.util.Optional;

@Service
public class ConfigurationServiceImpl implements ConfigurationService {
    private final ConfigurationRepository configurationRepository;

    public ConfigurationServiceImpl(ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    @Override
    public ResponseEntity update(Configuration configuration) {
        Optional<Configuration> configurationOptional = configurationRepository.findByUser(configuration.getUser());
        if (configurationOptional.isPresent()) {
            configuration.setId(configurationOptional.get().getId());
            configurationRepository.save(configuration);
            return ResponseEntity.ok(configuration);
        }
        return new ResponseEntity(new ResponseMessage("No Configuration Found for user " + configuration.getUser()), HttpStatus.NOT_FOUND);
    }

    @Override
    public Configuration save(Configuration configuration) {
        return configurationRepository.save(configuration);
    }

    @Override
    public ResponseEntity getConfiguration(String user) {
        if(Objects.isNull(user)) {
            return ResponseEntity.ok(new Configuration(null, true, true, null));
        }
        Optional<Configuration> configurationOptional = configurationRepository.findByUser(user);
        if(configurationOptional.isPresent()) {
            return ResponseEntity.ok(configurationOptional.get());
        }
        return ResponseEntity.ok(new Configuration(null, true, true, null));
    }
}
