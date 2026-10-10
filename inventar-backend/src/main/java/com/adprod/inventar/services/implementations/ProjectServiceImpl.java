package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ContributionRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.repositories.ProjectRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.ProjectService;
import com.adprod.inventar.services.SecurityContextService;
import com.adprod.inventar.services.WalletService;
import com.adprod.inventar.models.Wallet;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    /** Auto-managed expense category used to record project contributions in the expenses ledger. */

    private final ProjectRepository projectRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final WalletService walletService;
    private final SecurityContextService securityContextService;
    private final MongoTemplate mongoTemplate;
    private final ProjectCategories projectCategories;

    @Override
    public ResponseEntity<?> findAll(String account) {
        String username = securityContextService.username();
        List<Project> projects = projectRepository.findAllByUserAndAccount(username, account);
        if (projects.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Map<String, List<CurrencyTotalDTO>> totalsByProject = totalsByProjectId(
                projects.stream().map(Project::getId).collect(Collectors.toList()));

        // Newest first; matches what users typically expect on the list page.
        projects.sort(Comparator.comparing(Project::getCreatedTime, Comparator.nullsLast(Comparator.reverseOrder())));

        List<ProjectViewDTO> response = new ArrayList<>(projects.size());
        for (Project p : projects) {
            response.add(new ProjectViewDTO(
                    p,
                    totalsByProject.getOrDefault(p.getId(), Collections.emptyList())));
        }
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> findOne(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project " + id + " not found."));
        ensureOwned(project);
        List<CurrencyTotalDTO> totals = totalsByProjectId(Collections.singletonList(id))
                .getOrDefault(id, Collections.emptyList());
        return ResponseEntity.ok(new ProjectViewDTO(project, totals));
    }

    @Override
    public ResponseEntity<?> save(Project project) {
        accountService.checkAccount(project.getAccount());
        project.setUser(securityContextService.username());
        project.setCreatedTime(LocalDateTime.now());
        project.setLastModifiedDate(project.getCreatedTime());
        projectRepository.save(project);
        // The project's own expense category ("paid from this project's savings").
        projectCategories.sync(project);
        return ResponseEntity.ok(project);
    }

    @Override
    public ResponseEntity<?> update(String id, Project project) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project " + id + " not found."));
        ensureOwned(existing);
        accountService.checkAccount(existing.getAccount());
        project.setId(id);
        project.setUser(existing.getUser());
        project.setAccount(existing.getAccount());
        project.setCreatedTime(existing.getCreatedTime());
        project.setLastModifiedDate(LocalDateTime.now());
        projectRepository.save(project);
        projectCategories.sync(project);
        return ResponseEntity.ok(project);
    }

    @Override
    public ResponseEntity<?> delete(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project " + id + " not found."));
        ensureOwned(project);
        // Cascade: what is still saved in the project goes back to the sources it came from
        // (newest contributions first); money already spent from the project stays spent.
        List<Contribution> contributions = contributionRepository.findAllByProjectIdOrderByCreatedTimeDesc(id);
        Map<String, Double> remaining = new HashMap<>();
        for (CurrencyTotalDTO t : totalsByProjectId(Collections.singletonList(id)).getOrDefault(id, Collections.emptyList())) {
            remaining.put(t.getCurrency(), t.getTotal());
        }
        for (Contribution c : contributions) {
            if (expenseRepository.findByContributionId(c.getId()).isPresent()) {
                // Legacy contribution still mirrored as an expense: reversing it refunds it.
                removeLinkedExpense(c.getId());
                continue;
            }
            double left = remaining.getOrDefault(c.getCurrency(), 0.0);
            double refund = Math.min(left, Objects.requireNonNullElse(c.getAmount(), 0.0));
            if (refund > 0 && c.getWalletId() != null) {
                walletService.credit(c.getWalletId(), refund);
                remaining.put(c.getCurrency(), left - refund);
            }
        }
        contributionRepository.deleteAllByProjectId(id);
        projectRepository.deleteById(id);
        // Keep the category while expenses still point at it, so they keep their name.
        projectCategories.removeIfUnused(id, expenseRepository.existsByProjectId(id));
        return ResponseEntity.ok(new ResponseMessage("Project " + id + " was deleted."));
    }

    @Override
    public ResponseEntity<?> findContributions(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project " + projectId + " not found."));
        ensureOwned(project);
        return ResponseEntity.ok(contributionRepository.findAllByProjectIdOrderByCreatedTimeDesc(projectId));
    }

    @Override
    public ResponseEntity<?> saveContribution(String projectId, Contribution contribution) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project " + projectId + " not found."));
        ensureOwned(project);

        // The contribution is funded from a money source; its currency follows that source.
        Wallet wallet = walletService.getOwned(contribution.getWalletId());
        if (!Objects.equals(wallet.getAccount(), project.getAccount())) {
            throw new NotFoundException("Wallet " + contribution.getWalletId() + " not found.");
        }
        contribution.setProjectId(projectId);
        contribution.setUser(project.getUser());
        contribution.setAccount(project.getAccount());
        contribution.setCurrency(wallet.getCurrency());
        contribution.setCreatedTime(LocalDateTime.now());
        contribution.setLastModifiedDate(contribution.getCreatedTime());
        contributionRepository.save(contribution);

        // A contribution moves money from the source into the project — it is not spending,
        // so no expense is recorded. Spending the saved money later is an expense filed
        // under the project's category (see ExpenseServiceImpl).
        walletService.debit(contribution.getWalletId(), contribution.getAmount());

        return ResponseEntity.ok(contribution);
    }

    @Override
    public ResponseEntity<?> deleteContribution(String contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new NotFoundException("Contribution " + contributionId + " not found."));
        if (!Objects.equals(contribution.getUser(), securityContextService.username())) {
            throw new NotFoundException("Contribution " + contributionId + " not found.");
        }
        // Move the money back to its source. Legacy contributions were mirrored as an expense;
        // reversing that expense refunds the source instead.
        if (expenseRepository.findByContributionId(contributionId).isPresent()) {
            removeLinkedExpense(contributionId);
        } else if (contribution.getWalletId() != null) {
            walletService.credit(contribution.getWalletId(), contribution.getAmount());
        }
        contributionRepository.deleteById(contributionId);
        return ResponseEntity.ok(new ResponseMessage("Contribution " + contributionId + " was deleted."));
    }

    /**
     * Reverse the expense linked to {@code contributionId}, if any. Refunds the balance and
     * removes the expense record. Idempotent — safe to call when no link exists.
     */
    private void removeLinkedExpense(String contributionId) {
        if (contributionId == null) return;
        expenseRepository.findByContributionId(contributionId).ifPresent(expense -> {
            if (Objects.nonNull(expense.getWalletId())) {
                walletService.credit(expense.getWalletId(), expense.getMoneySpent());
            }
            expenseRepository.delete(expense);
        });
    }

    /**
     * Saved amount per project and currency: contributions (`amount`) minus expenses paid
     * from the project (`moneySpent`). Ids with nothing saved are absent from the result.
     */
    private Map<String, List<CurrencyTotalDTO>> totalsByProjectId(List<String> projectIds) {
        if (projectIds.isEmpty()) {
            return Collections.emptyMap();
        }
        TypedAggregation<Contribution> agg = Aggregation.newAggregation(
                Contribution.class,
                Aggregation.match(Criteria.where("projectId").in(projectIds)
                        .and("user").is(securityContextService.username())),
                Aggregation.group("projectId", "currency").sum("amount").as("total"));

        // Saved = contributions in, minus expenses paid out of the project.
        Map<String, Map<String, Double>> net = new HashMap<>();
        addTotals(net, mongoTemplate.aggregate(agg, "contributions", Map.class).getMappedResults(), 1);
        TypedAggregation<Expense> spent = Aggregation.newAggregation(
                Expense.class,
                Aggregation.match(Criteria.where("projectId").in(projectIds)
                        .and("user").is(securityContextService.username())),
                Aggregation.group("projectId", "currency").sum("moneySpent").as("total"));
        addTotals(net, mongoTemplate.aggregate(spent, "spending", Map.class).getMappedResults(), -1);

        Map<String, List<CurrencyTotalDTO>> grouped = new HashMap<>();
        net.forEach((projectId, byCurrency) -> byCurrency.forEach((currency, total) -> {
            if (Math.abs(total) < 0.005) return;
            grouped.computeIfAbsent(projectId, k -> new ArrayList<>())
                    .add(new CurrencyTotalDTO(currency, Math.round(total * 100) / 100.0));
        }));
        // Stable per-project ordering (largest currency first) so the UI doesn't reshuffle on refresh.
        for (List<CurrencyTotalDTO> list : grouped.values()) {
            list.sort(Comparator.comparing(CurrencyTotalDTO::getTotal).reversed());
        }
        return grouped;
    }

    /** Add `(projectId, currency) → total` aggregation rows into {@code into}, times {@code sign}. */
    private static void addTotals(Map<String, Map<String, Double>> into, List<Map> rows, int sign) {
        for (Map row : rows) {
            Object idObj = row.get("_id");
            if (!(idObj instanceof Map)) continue;
            Map<?, ?> id = (Map<?, ?>) idObj;
            String projectId = String.valueOf(id.get("projectId"));
            Object curObj = id.get("currency");
            String currency = curObj == null ? "Other" : String.valueOf(curObj);
            Object totalObj = row.get("total");
            double total = totalObj instanceof Number ? ((Number) totalObj).doubleValue() : 0.0;
            into.computeIfAbsent(projectId, k -> new HashMap<>()).merge(currency, sign * total, Double::sum);
        }
    }

    private void ensureOwned(Project project) {
        if (!Objects.equals(project.getUser(), securityContextService.username())) {
            // Treat foreign records as not-found so we don't leak existence.
            throw new NotFoundException("Project " + project.getId() + " not found.");
        }
    }
}
