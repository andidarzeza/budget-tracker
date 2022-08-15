package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.History;
import com.adprod.inventar.models.QHistory;
import com.adprod.inventar.models.QIncome;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.HistoryRepository;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;

@Service
@AllArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final HistoryRepository historyRepository;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        String action = params.get("action");
        String entity = params.get("entity");
        String message = params.get("message");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QHistory.history.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QHistory.history.account.eq(params.get("account")));
        if(Objects.nonNull(action)){
            booleanBuilder = booleanBuilder.and(QHistory.history.action.eq(EntityAction.valueOf(action)));
        }
        if(Objects.nonNull(entity)) {
            booleanBuilder = booleanBuilder.and(QHistory.history.entity.eq(EntityType.valueOf(entity)));
        }
        if(Objects.nonNull(message)) {
            booleanBuilder = booleanBuilder.and(QHistory.history.message.containsIgnoreCase(message));
        }
        Page<History> page = historyRepository.findAll(booleanBuilder, pageable);
        ResponseWrapper<History> historyWrapper = new ResponseWrapper();
        historyWrapper.setData(page.getContent());
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
