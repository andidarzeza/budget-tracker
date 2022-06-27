package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.History;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.HistoryWrapper;
import com.adprod.inventar.repositories.HistoryRepository;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final HistoryRepository historyRepository;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, String user) {
        Page<History> page = historyRepository.findAllByUser(pageable, user);
        HistoryWrapper historyWrapper = new HistoryWrapper();
        historyWrapper.setHistoryList(page.getContent());
        historyWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(historyWrapper);
    }

    @Override
    public ResponseEntity findOne(String id) {
        History history = historyRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Could not find History object for given id: " + id));
        return ResponseEntity.ok(history);
    }

    @Override
    public void save(History history) {
        this.historyRepository.save(history);
    }

    @Override
    public History from(EntityAction action, EntityType entity) {
        String username = securityContextService.username();
        String message = entity.toString() + " entity " + " " + action.toString() + " by user " + username;
        return new History(action, username, message, entity);
    }
}
