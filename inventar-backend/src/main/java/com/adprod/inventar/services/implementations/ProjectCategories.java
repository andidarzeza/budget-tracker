package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Category;
import com.adprod.inventar.models.Project;
import com.adprod.inventar.models.QCategory;
import com.adprod.inventar.models.enums.CategoryType;
import com.adprod.inventar.repositories.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

/**
 * Each project has a matching expense category, so it can be picked like any category when
 * adding an expense ("paid from this project's savings") and shows by name in the expense
 * list and the dashboard breakdown without any special casing.
 */
@Component
@AllArgsConstructor
public class ProjectCategories {

    static final String DESCRIPTION = "Paid from this project's savings";
    static final String DEFAULT_ICON = "savings";

    private final CategoryRepository categoryRepository;

    public Optional<Category> find(String projectId) {
        if (projectId == null) return Optional.empty();
        return categoryRepository.findOne(QCategory.category1.projectId.eq(projectId));
    }

    /** Create or refresh the project's category (name / icon follow the project). */
    public Category sync(Project project) {
        Category category = find(project.getId()).orElseGet(Category::new);
        category.setProjectId(project.getId());
        category.setCategory(project.getName());
        category.setIcon(project.getIcon() != null && !project.getIcon().isBlank() ? project.getIcon() : DEFAULT_ICON);
        category.setDescription(DESCRIPTION);
        category.setCategoryType(CategoryType.EXPENSE.name());
        category.setUser(project.getUser());
        category.setAccount(project.getAccount());
        category.setLastModifiedDate(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    /** Remove the project's category once nothing is filed under it any more. */
    public void removeIfUnused(String projectId, boolean stillUsed) {
        if (!stillUsed) {
            find(projectId).ifPresent(categoryRepository::delete);
        }
    }

    public static boolean isProjectCategory(Category category) {
        return category != null && Objects.nonNull(category.getProjectId());
    }
}
