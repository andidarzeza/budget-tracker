package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Incoming;
import com.adprod.inventar.models.ResponseMessage;
import com.adprod.inventar.models.SpendingCategory;
import com.adprod.inventar.models.wrappers.IncomingDTO;
import com.adprod.inventar.models.wrappers.IncomingWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.IncomingRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.IncomingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class IncomingServiceImpl implements IncomingService {
    private final IncomingRepository incomingRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;

    public IncomingServiceImpl(IncomingRepository incomingRepository, CategoryRepository categoryRepository, AccountService accountService) {
        this.incomingRepository = incomingRepository;
        this.categoryRepository = categoryRepository;
        this.accountService = accountService;
    }

    @Override
    public ResponseEntity getIncomings(Pageable pageable) {
        Page<Incoming> page = this.incomingRepository.findAll(pageable);
        IncomingWrapper incomingWrapper = new IncomingWrapper();
        List<Incoming> content = page.getContent();
        List<IncomingDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<SpendingCategory> data = categoryRepository.findById(item.getSpendingCategoryID());
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
    public ResponseEntity addIncoming(Incoming incoming) {
        if(this.accountService.addToBalance(incoming.getIncoming())) {
            incomingRepository.save(incoming);
            return ResponseEntity.ok(incoming);
        }
        return new ResponseEntity(new ResponseMessage("INTERNAL SERVER ERROR"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity getIncomingObject(String id) {
        return null;
    }

    @Override
    public ResponseEntity delete(String id) {
        Optional<Incoming> incoming = incomingRepository.findById(id);
        if(incoming.isPresent()) {
            incomingRepository.delete(incoming.get());
            return ResponseEntity.ok(new ResponseMessage("Deleted"));
        }
        return new ResponseEntity(new ResponseMessage("Not Found"), HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity update(Incoming incoming) {
        Optional<Incoming> incomingOptional = incomingRepository.findById(incoming.getId());
        if(incomingOptional.isPresent()) {
            incomingRepository.save(incoming);
            return ResponseEntity.ok(incoming);
        }
        return new ResponseEntity(new ResponseMessage("No Category to update was found ."), HttpStatus.NOT_FOUND);
    }
}
