package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.Income;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.ExpenseCategory;
import static com.adprod.inventar.models.enums.EntityAction.*;
import static com.adprod.inventar.models.enums.EntityType.INCOME;
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

    @Override
    public ResponseEntity findAll(Pageable pageable, String user) {
        Page<Income> page = incomeRepository.findAllByUser(pageable, user);
        IncomingWrapper incomingWrapper = new IncomingWrapper();
        List<Income> content = page.getContent();
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
    public ResponseEntity save(Income income) {
        accountService.addToBalance(income.getIncoming());
        incomeRepository.save(income);
        historyService.save(historyService.from(CREATE, INCOME));
        return ResponseEntity.ok(income);
    }

    @Override
    public Income findOne(String id) {
        return incomeRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("No Income Found with id: " + id));
    }

    @Override
    public ResponseEntity delete(String id) {
        Income income = findOne(id);
        this.accountService.removeFromBalance(income.getIncoming());
        incomeRepository.delete(income);
        historyService.save(historyService.from(DELETE, INCOME));
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Income income) {
        Income incomeDB = findOne(id);

        double removeAndAddAmount =  income.getIncoming() - incomeDB.getIncoming();
        this.accountService.addToBalance(removeAndAddAmount);
        income.setId(id);
        income.setCreatedTime(incomeDB.getCreatedTime());
        income.setLastModifiedDate(new Date());
        incomeRepository.save(income);
        historyService.save(historyService.from(UPDATE, INCOME));
        return ResponseEntity.ok(income);

    }
}
