package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Configuration;
import com.adprod.inventar.repositories.ConfigurationRepository;
import com.adprod.inventar.services.ConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.rmi.ConnectIOException;
import java.util.List;
import java.util.Optional;

@Service
public class ConfigurationServiceImpl implements ConfigurationService {
    private final ConfigurationRepository configurationRepository;

    public ConfigurationServiceImpl(ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    @Override
    public ResponseEntity updateConfiguration(Configuration configuration) {
        List<Configuration> configurations = configurationRepository.findAll();
        if (!configurations.isEmpty()) {
            Configuration configuration1 = configurations.get(0);
            configuration.setId(configuration1.getId());
        }
        configuration = configurationRepository.save(configuration);
        return ResponseEntity.ok(configuration);
    }

    @Override
    public ResponseEntity getConfiguration() {
        List<Configuration> configurations = this.configurationRepository.findAll();
        if(configurations.isEmpty()) {
            Configuration configuration = new Configuration(null, false, true);
            configuration = configurationRepository.save(configuration);
            return ResponseEntity.ok(configuration);
        } else {
            return ResponseEntity.ok(configurations.get(0));
        }
    }

}
