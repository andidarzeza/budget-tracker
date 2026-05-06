package com.adprod.inventar.services;

import com.adprod.inventar.models.Contribution;
import com.adprod.inventar.models.Project;
import org.springframework.http.ResponseEntity;

public interface ProjectService {
    /** All projects for the user/account, each with its current per-currency saved totals. */
    ResponseEntity<?> findAll(String account);
    /** Single project view with its per-currency totals. */
    ResponseEntity<?> findOne(String id);
    ResponseEntity<?> save(Project project);
    ResponseEntity<?> update(String id, Project project);
    /** Deletes the project and cascades all of its contributions. */
    ResponseEntity<?> delete(String id);

    /** Contributions for a project, sorted newest-first. */
    ResponseEntity<?> findContributions(String projectId);
    ResponseEntity<?> saveContribution(String projectId, Contribution contribution);
    ResponseEntity<?> deleteContribution(String contributionId);
}
