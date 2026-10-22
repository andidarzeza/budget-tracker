package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.EntityAction;
import static com.adprod.inventar.models.enums.EntityType.CONTRIBUTION;
import static com.adprod.inventar.models.enums.EntityType.EXPENSE;
import com.adprod.inventar.models.utils.Changes;
import com.adprod.inventar.models.wrappers.ExpenseDTO;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ContributionRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.repositories.ProjectRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.ExpenseService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WalletService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final ContributionRepository contributionRepository;
    private final ProjectRepository projectRepository;
    private final AccountService accountService;
    private final WalletService walletService;
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
        expense.setId(null);
        expense.setUser(securityContextService.username());
        // Only the app links an expense to a contribution (legacy records).
        expense.setContributionId(null);
        charge(expense);
        expenseRepository.save(expense);
        historyService.record(History.of(EntityAction.CREATE, EXPENSE, expense.getAccount(), expense.getId(), summary(expense)));
        return ResponseEntity.ok(expense);
    }

    @Override
    public ResponseEntity findOne(String id) {
        return ResponseEntity.ok(getOwned(id));
    }

    /** The current user's expense; someone else's is "not found". */
    private Expense getOwned(String id) {
        return expenseRepository
                .findById(id)
                .filter(expense -> Objects.equals(expense.getUser(), securityContextService.username()))
                .orElseThrow(
                        () -> new NotFoundException("Expense with id: " + id + " was not found.")
                );
    }

    @Override
    public ResponseEntity delete(String id) {
        Expense expense = getOwned(id);
        String summary = summary(expense);
        refund(expense.getWalletId(), expense.getMoneySpent());
        expenseRepository.delete(expense);
        historyService.record(History.of(EntityAction.DELETE, EXPENSE, expense.getAccount(), id, summary)
                .withSnapshot(expense));
        // Cascade: an expense auto-created from a project contribution and the contribution itself
        // are two views of the same event; deleting one always drops the other so they don't drift.
        if (Objects.nonNull(expense.getContributionId())) {
            contributionRepository.findById(expense.getContributionId())
                    .filter(contribution -> Objects.equals(contribution.getUser(), expense.getUser()))
                    .ifPresent(contribution -> {
                        contributionRepository.delete(contribution);
                        historyService.record(History.of(EntityAction.DELETE, CONTRIBUTION, contribution.getAccount(),
                                        contribution.getId(),
                                        Changes.summary(Changes.money(contribution.getAmount(), contribution.getCurrency()),
                                                historyService.projectName(contribution.getProjectId())))
                                .withParent(contribution.getProjectId())
                                .withSnapshot(contribution)
                                .causedBy("Its expense was deleted: " + summary));
                    });
        }
        return ResponseEntity.ok(new ResponseMessage("Deleted"));
    }

    @Override
    public ResponseEntity update(String id, Expense spending) {
        this.accountService.checkAccount(spending.getAccount());
        spending.setUser(securityContextService.username());
        Expense expense = getOwned(id);
        // Refund the old source, then charge the new one — handles changing amount, source,
        // and (via the source) currency in a single update.
        refund(expense.getWalletId(), expense.getMoneySpent());
        charge(spending);
        spending.setId(id);
        // The edit form sends the (possibly changed) date; keep the old one only if it's missing.
        if (Objects.isNull(spending.getCreatedTime())) {
            spending.setCreatedTime(expense.getCreatedTime());
        }
        spending.setLastModifiedDate(LocalDateTime.now());
        // Contributions own their linked expense; keep the link intact across edits.
        spending.setContributionId(expense.getContributionId());
        expenseRepository.save(spending);
        historyService.record(History.of(EntityAction.UPDATE, EXPENSE, spending.getAccount(), id, summary(spending))
                .withChanges(new Changes()
                        .add("Amount", money(expense), money(spending))
                        .add("Category", historyService.categoryName(expense.getCategoryID()),
                                historyService.categoryName(spending.getCategoryID()))
                        .add("Paid from", paidFrom(expense), paidFrom(spending))
                        .add("Date", expense.getCreatedTime(), spending.getCreatedTime())
                        .add("Description", expense.getDescription(), spending.getDescription())
                        .list()));
        return ResponseEntity.ok(spending);
    }

    /** "Groceries · 23.50 EUR from BKT · Lidl" */
    private String summary(Expense expense) {
        String from = paidFrom(expense);
        return Changes.summary(
                historyService.categoryName(expense.getCategoryID()),
                money(expense) + (from == null ? "" : " from " + from),
                expense.getDescription());
    }

    private static String money(Expense expense) {
        return Changes.money(expense.getMoneySpent(), expense.getCurrency());
    }

    /** The source's name, or "project X" when paid from a project's savings. */
    private String paidFrom(Expense expense) {
        if (expense.getProjectId() != null) {
            String project = historyService.projectName(expense.getProjectId());
            return project == null ? null : "project " + project;
        }
        return historyService.sourceName(expense.getWalletId());
    }

    /**
     * Take the expense out of its money source and set its currency from that source. A
     * project's category means "paid from the project's savings": no wallet is touched; the
     * expense is tagged with the project, which lowers the project's saved total.
     */
    private void charge(Expense expense) {
        Category category = expense.getCategoryID() == null ? null
                : categoryRepository.findById(expense.getCategoryID())
                        .filter(c -> Objects.equals(c.getUser(), expense.getUser())
                                && Objects.equals(c.getAccount(), expense.getAccount()))
                        .orElseThrow(() -> new NotFoundException("Category " + expense.getCategoryID() + " not found."));
        if (ProjectCategories.isProjectCategory(category)) {
            Project project = projectRepository.findById(category.getProjectId())
                    .filter(p -> Objects.equals(p.getUser(), expense.getUser())
                            && Objects.equals(p.getAccount(), expense.getAccount()))
                    .orElseThrow(() -> new NotFoundException("Project " + category.getProjectId() + " not found."));
            expense.setProjectId(project.getId());
            expense.setWalletId(null);
            expense.setCurrency(project.getTargetCurrency());
            return;
        }
        Wallet wallet = walletService.getOwned(expense.getWalletId(), expense.getAccount());
        // Currency always follows the chosen source so the two can never disagree.
        expense.setProjectId(null);
        expense.setCurrency(wallet.getCurrency());
        walletService.debit(wallet.getId(), expense.getMoneySpent());
    }

    /** Add an amount back to a source. No-op for legacy records without a source. */
    private void refund(String walletId, Double amount) {
        if (Objects.nonNull(walletId)) {
            walletService.credit(walletId, amount);
        }
    }
}
