package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;

import static com.adprod.inventar.models.enums.EntityAction.*;
import static com.adprod.inventar.models.enums.EntityType.INCOME;
import com.adprod.inventar.models.wrappers.IncomingDTO;
import com.adprod.inventar.models.wrappers.IncomingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.IncomeService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {

        String name = params.get("name");
        String description = params.get("description");
        Double income = Double.parseDouble(Objects.nonNull(params.get("income")) ? params.get("income") : "-1");
        String category = params.get("category");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QIncome.income.user.eq(securityContextService.username()));
        if(Objects.nonNull(name)){
            booleanBuilder = booleanBuilder.and(QIncome.income.name.containsIgnoreCase(name));
        }
        if(Objects.nonNull(description)) {
            booleanBuilder = booleanBuilder.and(QIncome.income.description.containsIgnoreCase(description));
        }
        if(income > 0) {
            booleanBuilder = booleanBuilder.and(QIncome.income.incoming.eq(income));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QIncome.income.categoryID.eq(category));
        }

        Page<Income> page = incomeRepository.findAll(booleanBuilder, pageable);
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
        income.setUser(securityContextService.username());
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
        income.setUser(securityContextService.username());
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
