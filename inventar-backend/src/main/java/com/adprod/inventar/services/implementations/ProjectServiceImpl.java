package com.adprod.inventar.services.implementations;

import com.adprod.inventar.exceptions.NotFoundException;
import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.CategoryType;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ContributionRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.repositories.ProjectRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.ProjectService;
import com.adprod.inventar.services.SecurityContextService;
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
    private static final String SAVINGS_CATEGORY_NAME = "Savings";
    private static final String SAVINGS_CATEGORY_ICON = "savings";

    private final ProjectRepository projectRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final SecurityContextService securityContextService;
    private final MongoTemplate mongoTemplate;

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
        return ResponseEntity.ok(project);
    }

    @Override
    public ResponseEntity<?> delete(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project " + id + " not found."));
        ensureOwned(project);
        // Cascade: contributions are meaningless without their project, and each one has a
        // matching expense that needs to be reversed (refund balance) before removal.
        List<Contribution> contributions = contributionRepository.findAllByProjectIdOrderByCreatedTimeDesc(id);
        for (Contribution c : contributions) {
            removeLinkedExpense(c.getId());
        }
        contributionRepository.deleteAllByProjectId(id);
        projectRepository.deleteById(id);
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

        contribution.setProjectId(projectId);
        contribution.setUser(project.getUser());
        contribution.setAccount(project.getAccount());
        contribution.setCreatedTime(LocalDateTime.now());
        contribution.setLastModifiedDate(contribution.getCreatedTime());
        contributionRepository.save(contribution);

        // Mirror the contribution as an expense so it shows up in the user's ledger and
        // reduces the account balance — money set aside for a goal is, in practice, spent.
        createLinkedExpense(project, contribution);

        return ResponseEntity.ok(contribution);
    }

    @Override
    public ResponseEntity<?> deleteContribution(String contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new NotFoundException("Contribution " + contributionId + " not found."));
        if (!Objects.equals(contribution.getUser(), securityContextService.username())) {
            throw new NotFoundException("Contribution " + contributionId + " not found.");
        }
        // Reverse the linked expense first (refund balance); then drop the contribution itself.
        removeLinkedExpense(contributionId);
        contributionRepository.deleteById(contributionId);
        return ResponseEntity.ok(new ResponseMessage("Contribution " + contributionId + " was deleted."));
    }

    /**
     * Create the expense that mirrors a contribution. Reuses the auto-managed
     * "Savings" expense category for the user/account so all contributions land in one
     * predictable bucket on the expenses list and the dashboard breakdown.
     */
    private void createLinkedExpense(Project project, Contribution contribution) {
        Category savings = findOrCreateSavingsCategory(project.getAccount());

        Expense expense = new Expense();
        expense.setUser(project.getUser());
        expense.setAccount(project.getAccount());
        expense.setMoneySpent(contribution.getAmount());
        expense.setCurrency(contribution.getCurrency());
        expense.setCategoryID(savings.getId());
        expense.setDescription(buildContributionDescription(project, contribution));
        expense.setContributionId(contribution.getId());
        expense.setCreatedTime(contribution.getCreatedTime());
        expense.setLastModifiedDate(contribution.getLastModifiedDate());

        accountService.removeFromBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
        expenseRepository.save(expense);
    }

    /**
     * Reverse the expense linked to {@code contributionId}, if any. Refunds the balance and
     * removes the expense record. Idempotent — safe to call when no link exists.
     */
    private void removeLinkedExpense(String contributionId) {
        if (contributionId == null) return;
        expenseRepository.findByContributionId(contributionId).ifPresent(expense -> {
            accountService.addToBalance(expense.getAccount(), expense.getCurrency(), expense.getMoneySpent());
            expenseRepository.delete(expense);
        });
    }

    /**
     * Find the user's auto-managed "Savings" expense category for this account, creating it
     * if needed. Lazily created so users who never use projects don't see it.
     */
    private Category findOrCreateSavingsCategory(String account) {
        String username = securityContextService.username();
        Optional<Category> existing = categoryRepository.findAll().stream()
                .filter(c -> Objects.equals(c.getUser(), username)
                        && Objects.equals(c.getAccount(), account)
                        && SAVINGS_CATEGORY_NAME.equalsIgnoreCase(c.getCategory())
                        && CategoryType.EXPENSE.name().equalsIgnoreCase(c.getCategoryType()))
                .findFirst();
        if (existing.isPresent()) {
            return existing.get();
        }
        Category category = new Category();
        category.setCategory(SAVINGS_CATEGORY_NAME);
        category.setIcon(SAVINGS_CATEGORY_ICON);
        category.setDescription("Auto-created for project contributions");
        category.setCategoryType(CategoryType.EXPENSE.name());
        category.setUser(username);
        category.setAccount(account);
        category.setLastModifiedDate(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    private String buildContributionDescription(Project project, Contribution contribution) {
        String prefix = "Saved for: " + Objects.toString(project.getName(), "");
        String note = contribution.getDescription();
        return note != null && !note.trim().isEmpty() ? prefix + " — " + note.trim() : prefix;
    }

    /**
     * Aggregate `contributions` by `(projectId, currency)` summing `amount`,
     * for the given set of project ids. Returns an empty result for ids with no contributions.
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

        List<Map> rows = mongoTemplate.aggregate(agg, "contributions", Map.class).getMappedResults();
        Map<String, List<CurrencyTotalDTO>> grouped = new HashMap<>();
        for (Map row : rows) {
            Object idObj = row.get("_id");
            if (!(idObj instanceof Map)) continue;
            Map<?, ?> id = (Map<?, ?>) idObj;
            String projectId = String.valueOf(id.get("projectId"));
            Object curObj = id.get("currency");
            String currency = curObj == null ? "Other" : String.valueOf(curObj);
            Object totalObj = row.get("total");
            double total = totalObj instanceof Number ? ((Number) totalObj).doubleValue() : 0.0;
            if (total == 0.0) continue;
            grouped.computeIfAbsent(projectId, k -> new ArrayList<>())
                    .add(new CurrencyTotalDTO(currency, total));
        }
        // Stable per-project ordering (largest currency first) so the UI doesn't reshuffle on refresh.
        for (List<CurrencyTotalDTO> list : grouped.values()) {
            list.sort(Comparator.comparing(CurrencyTotalDTO::getTotal).reversed());
        }
        return grouped;
    }

    private void ensureOwned(Project project) {
        if (!Objects.equals(project.getUser(), securityContextService.username())) {
            // Treat foreign records as not-found so we don't leak existence.
            throw new NotFoundException("Project " + project.getId() + " not found.");
        }
    }
}
