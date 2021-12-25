package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.SpendingCategory;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.IncomingDTO;
import com.adprod.inventar.models.wrappers.IncomingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.IncomeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class IncomeServiceImpl implements IncomeService {
    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final EntityType entityType = EntityType.INCOME;

    public IncomeServiceImpl(IncomeRepository incomeRepository, CategoryRepository categoryRepository, AccountService accountService, HistoryService historyService) {
        this.incomeRepository = incomeRepository;
        this.categoryRepository = categoryRepository;
        this.accountService = accountService;
        this.historyService = historyService;
    }

    @Override
    public ResponseEntity findAll(Pageable pageable, String user) {
        Page<Incoming> page = this.incomeRepository.findAllByUser(pageable, user);
        IncomingWrapper incomingWrapper = new IncomingWrapper();
        List<Incoming> content = page.getContent();
        List<IncomingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<SpendingCategory> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                SpendingCategory sc = data.get();
                response.add(new IncomingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getName(), item.getIncoming(), item.getDescription()));
            }
        });
        incomingWrapper.setIncomings(response);
        incomingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(incomingWrapper);
    }

    @Override
    public ResponseEntity save(Incoming incoming) {
        if(this.accountService.addToBalance(incoming.getIncoming())) {
            incomeRepository.save(incoming);
            historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
            return ResponseEntity.ok(incoming);
        }
        return new ResponseEntity(new ResponseMessage("INTERNAL SERVER ERROR"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity findOne(String id) {
        return null;
    }

    @Override
    public ResponseEntity delete(String id) {
        Optional<Incoming> incoming = incomeRepository.findById(id);
        if(incoming.isPresent()) {
            incomeRepository.delete(incoming.get());
            historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity update(String id, Incoming income) {
        Optional<Incoming> incomingOptional = incomeRepository.findById(id);
        if(incomingOptional.isPresent()) {
            income.setId(id);
            incomeRepository.save(income);
            historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
            return ResponseEntity.ok(income);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
