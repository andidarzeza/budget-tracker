package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.Category;
import com.adprod.inventar.models.History;
import com.adprod.inventar.models.Project;
import com.adprod.inventar.models.QHistory;
import com.adprod.inventar.models.Wallet;
import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.adprod.inventar.models.wrappers.ResponseWrapper;
import com.adprod.inventar.repositories.CategoryRepository;
import com.adprod.inventar.repositories.HistoryRepository;
import com.adprod.inventar.repositories.ProjectRepository;
import com.adprod.inventar.repositories.WalletRepository;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.SecurityContextService;
import com.querydsl.core.BooleanBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    /** Entries older than this are removed by MongoDB (TTL index on `date`). */
    private static final Duration RETENTION = Duration.ofDays(365);

    private final HistoryRepository historyRepository;
    private final SecurityContextService securityContextService;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;
    private final ProjectRepository projectRepository;
    private final MongoTemplate mongoTemplate;

    /** Index for the page's query (user + account, newest first) and the retention TTL. */
    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        try {
            IndexOperations indexes = mongoTemplate.indexOps(History.class);
            indexes.ensureIndex(new Index()
                    .on("user", Sort.Direction.ASC)
                    .on("account", Sort.Direction.ASC)
                    .on("date", Sort.Direction.DESC)
                    .named("user_account_date"));
            indexes.ensureIndex(new Index()
                    .on("date", Sort.Direction.ASC)
                    .expire(RETENTION)
                    .named("date_ttl"));
        } catch (RuntimeException ex) {
            log.warn("Could not create the history indexes: {}", ex.getMessage());
        }
    }

    @Override
    public ResponseEntity findAll(Pageable pageable, Map<String, String> params) {
        String action = params.get("action");
        String entity = params.get("entity");
        String summary = params.get("summary");
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        booleanBuilder = booleanBuilder.and(QHistory.history.user.eq(securityContextService.username()));
        booleanBuilder = booleanBuilder.and(QHistory.history.account.eq(params.get("account")));
        if(Objects.nonNull(action)){
            booleanBuilder = booleanBuilder.and(QHistory.history.action.eq(EntityAction.valueOf(action)));
        }
        if(Objects.nonNull(entity)) {
            booleanBuilder = booleanBuilder.and(QHistory.history.entity.eq(EntityType.valueOf(entity)));
        }
        if(Objects.nonNull(summary)) {
            booleanBuilder = booleanBuilder.and(QHistory.history.summary.containsIgnoreCase(summary));
        }
        Page<History> page = historyRepository.findAll(booleanBuilder, pageable);
        ResponseWrapper<History> historyWrapper = new ResponseWrapper();
        historyWrapper.setData(page.getContent());
        historyWrapper.setCount(page.getTotalElements());
        return ResponseEntity.ok().body(historyWrapper);
    }

    @Override
    public void record(History history) {
        history.setUser(securityContextService.username());
        historyRepository.save(history);
    }

    @Override
    public String categoryName(String categoryId) {
        return categoryId == null ? null
                : categoryRepository.findById(categoryId).map(Category::getCategory).orElse(null);
    }

    @Override
    public String sourceName(String walletId) {
        return walletId == null ? null
                : walletRepository.findById(walletId).map(Wallet::getName).orElse(null);
    }

    @Override
    public String projectName(String projectId) {
        return projectId == null ? null
                : projectRepository.findById(projectId).map(Project::getName).orElse(null);
    }
}
