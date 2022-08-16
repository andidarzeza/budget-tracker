package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;

import static com.adprod.inventar.models.enums.EntityAction.*;
import static com.adprod.inventar.models.enums.EntityType.INCOME;
import com.adprod.inventar.models.wrappers.IncomeDTO;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
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

        String description = params.get("description");
        Double income = Double.parseDouble(Objects.nonNull(params.get("income")) ? params.get("income") : "-1");
        String category = params.get("category");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QIncome.income.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QIncome.income.account.eq(params.get("account")));
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
        ResponseWrapper<IncomeDTO> incomeWrapper = new ResponseWrapper();
        List<Income> content = page.getContent();
        List<IncomeDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<Category> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                Category sc = data.get();
                response.add(new IncomeDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription(), item.getCurrency()));
            } else {
                response.add(new IncomeDTO(item.getId(), "No Category Found", "0", item.getCreatedTime(), item.getLastModifiedDate(), item.getName(), item.getIncoming(), item.getDescription(), item.getCurrency()));
            }
        });
        incomeWrapper.setData(response);
        incomeWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(incomeWrapper);
    }

    @Override
    public ResponseEntity save(Income income) {
        this.accountService.checkAccount(income.getAccount());
        income.setUser(securityContextService.username());
        accountService.addToBalance(income.getAccount(), income.getCurrency(), income.getIncoming());
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
        accountService.removeFromBalance(income.getAccount(), income.getCurrency(), income.getIncoming());
        incomeRepository.delete(income);
        historyService.save(historyService.from(DELETE, INCOME));
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Income income) {
        accountService.checkAccount(income.getAccount());
        income.setUser(securityContextService.username());
        Income incomeDB = findOne(id);
        double removeAndAddAmount =  income.getIncoming() - incomeDB.getIncoming();
        this.accountService.addToBalance(income.getAccount(), income.getCurrency(), removeAndAddAmount);
        income.setId(id);
        income.setCreatedTime(incomeDB.getCreatedTime());
        income.setLastModifiedDate(new Date());
        incomeRepository.save(income);
        historyService.save(historyService.from(UPDATE, INCOME));
        return ResponseEntity.ok(income);

    }
}
