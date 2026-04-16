package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.EXPENSE;
import com.adprod.inventar.models.wrappers.ExpenseDTO;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private static final String VERIFY_INVOICE_API_URL = "https://efiskalizimi-app.tatime.gov.al/invoice-check/api/verifyInvoice";
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final HistoryService historyService;
    private final SecurityContextService securityContextService;

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        this.accountService.checkAccount(params.get("account"));
        String description = params.get("description");
        Double expense = Double.parseDouble(Objects.nonNull(params.get("expense")) ? params.get("expense") : "-1");
        String category = params.get("category");
        BooleanBuilder booleanBuilder = new BooleanBuilder()
                .and(QExpense.expense.user.eq(securityContextService.username()))
                .and(QExpense.expense.account.eq(params.get("account")))
                .and(QExpense.expense.description.containsIgnoreCase(Objects.toString(description, "")));
        if(expense > 0) {
            booleanBuilder = booleanBuilder.and(QExpense.expense.moneySpent.eq(expense));
        }
        if(Objects.nonNull(category)) {
            booleanBuilder = booleanBuilder.and(QExpense.expense.categoryID.eq(category));
        }
        Page<Expense> page = expenseRepository.findAll(booleanBuilder, pageable);

        ResponseWrapper<ExpenseDTO> spendingWrapper = new ResponseWrapper();
        List<Expense> content = page.getContent();
        List<ExpenseDTO> response = new ArrayList<>();
        content.forEach(item -> {
            Optional<Category> data = categoryRepository.findById(item.getCategoryID());
            if(data.isPresent()) {
                Category sc = data.get();
                response.add(new ExpenseDTO(item.getId(), sc.getCategory(), sc.getId(), item.getCreatedTime(), item.getLastModifiedDate(), item.getMoneySpent(), item.getDescription(), item.getCurrency()));
            } else {
                response.add(new ExpenseDTO(item.getId(), "unknown", "unknown", item.getCreatedTime(), item.getLastModifiedDate(), item.getMoneySpent(), item.getDescription(), item.getCurrency()));

            }
        });
        spendingWrapper.setData(response);
        spendingWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(spendingWrapper);
    }

    @Override
    public ResponseEntity save(Expense expense) {
        this.accountService.checkAccount(expense.getAccount());
        expense.setUser(securityContextService.username());
        accountService.removeFromBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
        expenseRepository.save(expense);
        historyService.save(historyService.from(EntityAction.CREATE, EXPENSE, expense.getAccount()));
        return ResponseEntity.ok(expense);
    }

    @Override
    public ResponseEntity findOne(String id) {
        Expense expense = expenseRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException("Expense with id: " + id + " was not found.")
                );
        return ResponseEntity.ok(expense);
    }

    @Override
    public ResponseEntity delete(String id) {
        Expense expense = (Expense) findOne(id).getBody();
        accountService.addToBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
        expenseRepository.delete(expense);
        historyService.save(historyService.from(EntityAction.DELETE, EXPENSE, expense.getAccount()));
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Expense spending) {
        this.accountService.checkAccount(spending.getAccount());
        spending.setUser(securityContextService.username());
        Expense expense = (Expense) findOne(id).getBody();
        double removeAndAddAmount = expense.getMoneySpent() - spending.getMoneySpent();
        accountService.addToBalance(expense.getAccount(), expense.getCurrency(), removeAndAddAmount);
        spending.setId(id);
        spending.setCreatedTime(expense.getCreatedTime());
        spending.setLastModifiedDate(LocalDateTime.now());
        expenseRepository.save(spending);
        historyService.save(historyService.from(EntityAction.UPDATE, EXPENSE, spending.getAccount()));
        return ResponseEntity.ok(spending);
    }

    @Override
    public ResponseEntity verifyInvoiceFromUrl(InvoiceVerificationFromUrlRequest request) {
        if (Objects.isNull(request) || Objects.isNull(request.getUrl()) || request.getUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ResponseMessage("URL is required."));
        }

        Map<String, String> qrParams = extractQrParams(request.getUrl().trim());
        String iic = qrParams.get("iic");
        String dateTimeCreated = qrParams.get("crtd");
        String tin = qrParams.get("tin");

        if (Objects.isNull(iic) || Objects.isNull(dateTimeCreated) || Objects.isNull(tin)) {
            return ResponseEntity.badRequest()
                    .body(new ResponseMessage("The scanned URL does not contain iic, crtd, and tin parameters."));
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("iic", iic);
        formData.add("dateTimeCreated", dateTimeCreated);
        formData.add("tin", tin);

        try {
            Map<String, Object> verificationResponse = WebClient.builder()
                    .baseUrl(VERIFY_INVOICE_API_URL)
                    .build()
                    .post()
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            Object totalPrice = Objects.nonNull(verificationResponse) ? verificationResponse.get("totalPrice") : null;
            Object seller = Objects.nonNull(verificationResponse) ? verificationResponse.get("seller") : null;
            if (Objects.isNull(totalPrice)) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(new ResponseMessage("External service response does not include totalPrice."));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("totalPrice", totalPrice);
            response.put("seller", seller);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new ResponseMessage("Failed to verify invoice with external service."));
        }
    }

    private Map<String, String> extractQrParams(String scannedUrl) {
        URI uri = URI.create(scannedUrl);
        String query = uri.getQuery();
        String fragment = uri.getFragment();
        String fragmentQuery = null;
        if (Objects.nonNull(fragment) && fragment.contains("?")) {
            fragmentQuery = fragment.substring(fragment.indexOf("?") + 1);
        }

        Map<String, String> params = new HashMap<>();
        mergeQueryParams(params, query);
        mergeQueryParams(params, fragmentQuery);
        return params;
    }

    private void mergeQueryParams(Map<String, String> target, String query) {
        if (Objects.isNull(query) || query.isEmpty()) {
            return;
        }
        Map<String, String> extracted = UriComponentsBuilder.newInstance()
                .query(query)
                .build()
                .getQueryParams()
                .toSingleValueMap();
        target.putAll(extracted);
    }
}
