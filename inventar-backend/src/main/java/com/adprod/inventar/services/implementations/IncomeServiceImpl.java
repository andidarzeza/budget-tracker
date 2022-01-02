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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            } else {
                response.add(new IncomingDTO(item.getId(), "No Category Found", "0", item.getCreatedTime(), item.getName(), item.getIncoming(), item.getDescription()));
            }
        });
        incomingWrapper.setIncomings(response);
        incomingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(incomingWrapper);
    }

    @Override
    public ResponseEntity save(Incoming incoming) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(this.accountService.addToBalance(incoming.getIncoming(), authentication.getName())) {
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
        Optional<Incoming> incomeOptional = incomeRepository.findById(id);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(incomeOptional.isPresent()) {
            if(this.accountService.removeFromBalance(incomeOptional.get().getIncoming(), authentication.getName())) {
                incomeRepository.delete(incomeOptional.get());
                historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
                return ResponseEntity.ok(new ResponseMessage("Deleted"));
            }
            return new ResponseEntity(new ResponseMessage("Something went wrong, cannot proceed with request."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity update(String id, Incoming income) {
        Optional<Incoming> incomingOptional = incomeRepository.findById(id);
        if(incomingOptional.isPresent()) {

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            double removeAndAddAmount =  income.getIncoming() - incomingOptional.get().getIncoming();
            if(this.accountService.addToBalance(removeAndAddAmount, authentication.getName())) {
                income.setId(id);
                income.setCreatedTime(incomingOptional.get().getCreatedTime());
                incomeRepository.save(income);
                historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
                return ResponseEntity.ok(income);
            }
            return new ResponseEntity(new ResponseMessage("Something went wrong, cannot proceed with request."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
