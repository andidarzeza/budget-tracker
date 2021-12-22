package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.History;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.SpendingCategory;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.CategoryWrapper;
import com.adprod.inventar.models.wrappers.HistoryWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.HistoryRepository;
import com.adprod.inventar.services.CategoryService;
import com.adprod.inventar.services.HistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class HistoryServiceImpl implements HistoryService {
    private final HistoryRepository historyRepository;

    public HistoryServiceImpl(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Override
    public ResponseEntity findAll(Pageable pageable, String user) {
        Page<History> page = this.historyRepository.findAllByUser(pageable, user);
        HistoryWrapper historyWrapper = new HistoryWrapper();
        historyWrapper.setHistoryList(page.getContent());
        historyWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(historyWrapper);
    }

    @Override
    public ResponseEntity findOne(String id) {
        Optional<History> historyOptional = historyRepository.findById(id);
        if(historyOptional.isPresent()) {
            return ResponseEntity.ok(historyOptional.get());
        }
        return new ResponseEntity(new ResponseMessage("No History found for given id: " + id+ "."), HttpStatus.NOT_FOUND);
    }

    @Override
    public void save(History history) {
        this.historyRepository.save(history);
    }

    @Override
    public History from(EntityAction action, EntityType entity) {
        String message = action.toString() + " action performed on " + entity.toString() + " Entity.";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new History(action, authentication.getName(), message, entity);
    }
}
