package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.ExpenseCategory;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.IncomingDTO;
import com.adprod.inventar.models.wrappers.IncomingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.IncomeService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final EntityType entityType = EntityType.INCOME;

    @Override
    public ResponseEntity findAll(Pageable pageable, String user) {
        Page<Incoming> page = this.incomeRepository.findAllByUser(pageable, user);
        IncomingWrapper incomingWrapper = new IncomingWrapper();
        List<Incoming> content = page.getContent();
        List<IncomingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<ExpenseCategory> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                ExpenseCategory sc = data.get();
                response.add(new IncomingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription()));
            } else {
                response.add(new IncomingDTO(item.getId(), "No Category Found", "0", item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription()));
            }
        });
        incomingWrapper.setIncomes(response);
        incomingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(incomingWrapper);
    }

    @Override
    public ResponseEntity save(Incoming incoming) {
        this.accountService.addToBalance(incoming.getIncoming());
        incomeRepository.save(incoming);
        historyService.save(historyService.from(EntityAction.CREATE, this.entityType));
        return ResponseEntity.ok(incoming);
    }

    @Override
    public Incoming findOne(String id) {
        return incomeRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("No Income Found with id: " + id));
    }

    @Override
    public ResponseEntity delete(String id) {
        Incoming income = findOne(id);
        this.accountService.removeFromBalance(income.getIncoming());
        incomeRepository.delete(income);
        historyService.save(historyService.from(EntityAction.DELETE, this.entityType));
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Incoming income) {
        Incoming incomeDB = findOne(id);

        double removeAndAddAmount =  income.getIncoming() - incomeDB.getIncoming();
        this.accountService.addToBalance(removeAndAddAmount);
        income.setId(id);
        income.setCreatedTime(incomeDB.getCreatedTime());
        income.setLastModifiedDate(new Date());
        incomeRepository.save(income);
        historyService.save(historyService.from(EntityAction.UPDATE, this.entityType));
        return ResponseEntity.ok(income);

    }
}
