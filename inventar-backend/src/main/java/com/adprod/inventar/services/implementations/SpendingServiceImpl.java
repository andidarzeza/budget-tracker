package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.models.wrappers.SpendingDTO;
import com.adprod.inventar.models.wrappers.SpendingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.SpendingRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.SpendingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SpendingServiceImpl implements SpendingService {
    private final SpendingRepository spendingRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;

    public SpendingServiceImpl(SpendingRepository spendingRepository, CategoryRepository categoryRepository, AccountService accountService) {
        this.spendingRepository = spendingRepository;
        this.categoryRepository = categoryRepository;
        this.accountService = accountService;
    }

    @Override
    public ResponseEntity getSpendings(Pageable pageable) {
        Page<Spending> page = this.spendingRepository.findAll(pageable);
        SpendingWrapper spendingWrapper = new SpendingWrapper();
        List<Spending> content = page.getContent();
        List<SpendingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<SpendingCategory> data = categoryRepository.findById(item.getSpendingCategoryID());
            if(data.isPresent()) {
                SpendingCategory sc = data.get();
                response.add(new SpendingDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getName(), item.getMoneySpent(), item.getDescription()));
            }
        });
        spendingWrapper.setSpendings(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity addSpending(Spending spending) {
        if(this.accountService.removeFromBalance(spending.getMoneySpent())) {
            spendingRepository.save(spending);
            return ResponseEntity.ok(spending);
        }
        return new ResponseEntity(new ResponseMessage("INTERNAL SERVER ERROR"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity getSpendObject(String id) {
        return null;
    }

    @Override
    public ResponseEntity delete(String id) {
        Optional<Spending> spending = spendingRepository.findById(id);
        if(spending.isPresent()) {
            spendingRepository.delete(spending.get());
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity update(Spending spending) {
        Optional<Spending> categoryOptional = spendingRepository.findById(spending.getId());
        if(categoryOptional.isPresent()) {
            spendingRepository.save(spending);
            return ResponseEntity.ok(spending);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
