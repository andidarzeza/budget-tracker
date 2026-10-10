package com.adprod.inventar.migrations;

import com.adprod.inventar.models.Project;
import com.adprod.inventar.repositories.ProjectRepository;
import com.adprod.inventar.services.implementations.ProjectCategories;
import com.mongodb.client.result.DeleteResult;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

/**
 * Idempotent migration for "project contributions are transfers, not expenses".
 *
 * <ol>
 *   <li>Deletes the "Savings" expenses that used to mirror each contribution. Their sources are
 *       <b>not</b> refunded: the money really did leave the source — into the project.</li>
 *   <li>Deletes the auto-created "Savings" expense categories once nothing uses them.</li>
 *   <li>Gives every project its own expense category, so it can be picked when adding an
 *       expense paid from the project's savings.</li>
 * </ol>
 * Independent of the wallet migration; re-running finds nothing left to do.
 */
@Component
@Order(20)
@AllArgsConstructor
public class ProjectFundsMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProjectFundsMigrationRunner.class);
    private static final String SAVINGS_AUTO_DESCRIPTION = "Auto-created for project contributions";

    private final MongoTemplate mongoTemplate;
    private final ProjectRepository projectRepository;
    private final ProjectCategories projectCategories;

    @Override
    public void run(ApplicationArguments args) {
        DeleteResult mirrored = mongoTemplate.remove(
                Query.query(Criteria.where("contributionId").ne(null)), "spending");
        if (mirrored.getDeletedCount() > 0) {
            log.info("Removed {} contribution 'Savings' expenses (contributions are transfers now).",
                    mirrored.getDeletedCount());
        }

        int removedCategories = 0;
        for (org.bson.Document category : mongoTemplate.getCollection("category")
                .find(new org.bson.Document("description", SAVINGS_AUTO_DESCRIPTION)
                        .append("category", "Savings")
                        .append("categoryType", "EXPENSE"))) {
            String id = category.getObjectId("_id").toHexString();
            boolean used = mongoTemplate.exists(Query.query(Criteria.where("categoryID").is(id)), "spending");
            if (!used) {
                mongoTemplate.remove(Query.query(Criteria.where("_id").is(category.getObjectId("_id"))), "category");
                removedCategories++;
            }
        }
        if (removedCategories > 0) {
            log.info("Removed {} unused auto 'Savings' categories.", removedCategories);
        }

        int created = 0;
        for (Project project : projectRepository.findAll()) {
            if (projectCategories.find(project.getId()).isEmpty()) {
                projectCategories.sync(project);
                created++;
            }
        }
        if (created > 0) {
            log.info("Created expense categories for {} projects.", created);
        }
    }
}
