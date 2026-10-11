package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.ExpenseRepository;
import com.adprod.inventar.repositories.IncomeRepository;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.SearchService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@AllArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final SecurityContextService securityContextService;

    @Override
    public SearchResultDTO search(String account, String query, int limit) {
        accountService.checkAccount(account);
        String q = Objects.toString(query, "").trim();
        if (q.isEmpty()) return new SearchResultDTO(List.of(), List.of());
        String user = securityContextService.username();

        // All of the account's categories: matched by name, and used to label hits.
        Map<String, Category> categories = StreamSupport.stream(categoryRepository.findAll(
                        QCategory.category1.user.eq(user).and(QCategory.category1.account.eq(account))).spliterator(), false)
                .collect(Collectors.toMap(Category::getId, Function.identity()));
        String needle = q.toLowerCase(Locale.ROOT);
        Set<String> categoryIds = categories.values().stream()
                .filter(c -> c.getCategory() != null && c.getCategory().toLowerCase(Locale.ROOT).contains(needle))
                .map(Category::getId)
                .collect(Collectors.toSet());
        Double amount = parseAmount(q);
        PageRequest page = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdTime"));

        BooleanBuilder expenseMatch = new BooleanBuilder(QExpense.expense.description.containsIgnoreCase(q));
        if (!categoryIds.isEmpty()) expenseMatch.or(QExpense.expense.categoryID.in(categoryIds));
        if (amount != null) expenseMatch.or(QExpense.expense.moneySpent.eq(amount));
        List<SearchHitDTO> expenses = expenseRepository.findAll(new BooleanBuilder()
                        .and(QExpense.expense.user.eq(user))
                        .and(QExpense.expense.account.eq(account))
                        .and(expenseMatch), page)
                .map(e -> hit(e.getId(), "EXPENSE", e.getDescription(), e.getCategoryID(), categories, e.getMoneySpent(), e.getCurrency(),
                        e.getCreatedTime() == null ? null : e.getCreatedTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()))
                .getContent();

        BooleanBuilder incomeMatch = new BooleanBuilder(QIncome.income.description.containsIgnoreCase(q));
        if (!categoryIds.isEmpty()) incomeMatch.or(QIncome.income.categoryID.in(categoryIds));
        if (amount != null) incomeMatch.or(QIncome.income.incoming.eq(amount));
        List<SearchHitDTO> incomes = incomeRepository.findAll(new BooleanBuilder()
                        .and(QIncome.income.user.eq(user))
                        .and(QIncome.income.account.eq(account))
                        .and(incomeMatch), page)
                .map(i -> hit(i.getId(), "INCOME", i.getDescription(), i.getCategoryID(), categories, i.getIncoming(), i.getCurrency(),
                        i.getCreatedTime() == null ? null : i.getCreatedTime().getTime()))
                .getContent();

        return new SearchResultDTO(expenses, incomes);
    }

    private SearchHitDTO hit(String id, String type, String description, String categoryId, Map<String, Category> categories,
                             Double amount, String currency, Long date) {
        Category c = categoryId == null ? null : categories.get(categoryId);
        return new SearchHitDTO(id, type, description, categoryId, c == null ? null : c.getCategory(),
                c == null ? null : c.getIcon(), amount, currency, date);
    }

    /** "1,570" / "1570.00" / "300" → a number; anything else → null. */
    private static Double parseAmount(String q) {
        String s = q.replace(" ", "").replace(",", "");
        if (!s.matches("\\d+(\\.\\d+)?")) return null;
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
