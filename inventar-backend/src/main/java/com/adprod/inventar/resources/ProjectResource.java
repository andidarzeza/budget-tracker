package com.adprod.inventar.resources;

import com.adprod.inventar.models.Contribution;
import com.adprod.inventar.models.Project;
import com.adprod.inventar.services.ProjectService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/projects")
public class ProjectResource {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<?> findAll(@RequestParam String account) {
        return projectService.findAll(account);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findOne(@PathVariable String id) {
        return projectService.findOne(id);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Project project) {
        return projectService.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Project project) {
        return projectService.update(id, project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return projectService.delete(id);
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<?> findContributions(@PathVariable String id) {
        return projectService.findContributions(id);
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<?> saveContribution(@PathVariable String id, @RequestBody Contribution contribution) {
        return projectService.saveContribution(id, contribution);
    }

    @DeleteMapping("/contributions/{contributionId}")
    public ResponseEntity<?> deleteContribution(@PathVariable String contributionId) {
        return projectService.deleteContribution(contributionId);
    }
}
