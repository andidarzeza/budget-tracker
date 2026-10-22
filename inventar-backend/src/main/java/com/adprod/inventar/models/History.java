package com.adprod.inventar.models;

import com.adprod.inventar.models.enums.EntityAction;
import com.adprod.inventar.models.enums.EntityType;
import com.querydsl.core.annotations.QueryEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document
@Getter
@Setter
@NoArgsConstructor
@QueryEntity
public class History {

    @Id
    private String id;
    private Date date = new Date();
    private EntityAction action;
    private String user;
    private EntityType entity;
    private String account;
    /** The record the action was on, so the page can link to it. */
    private String entityId;
    /** The record it belongs to, where it has no page of its own (a contribution's project). */
    private String parentId;
    /** What the record was at the time, e.g. "Groceries · 23.50 EUR from BKT". */
    private String summary;
    /** Set when the app did this on its own, e.g. "Balance of BKT edited". */
    private String cause;
    /** Updates: the fields that changed. */
    private List<Change> changes = new ArrayList<>();
    /** Deletes: the record as it was, so it can be shown (or restored) later. */
    private Object snapshot;

    public static History of(EntityAction action, EntityType entity, String account, String entityId, String summary) {
        History history = new History();
        history.action = action;
        history.entity = entity;
        history.account = account;
        history.entityId = entityId;
        history.summary = summary;
        return history;
    }

    public History withChanges(List<Change> changes) {
        this.changes = changes;
        return this;
    }

    public History withSnapshot(Object snapshot) {
        this.snapshot = snapshot;
        return this;
    }

    public History withParent(String parentId) {
        this.parentId = parentId;
        return this;
    }

    public History causedBy(String cause) {
        this.cause = cause;
        return this;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Change {
        private String field;
        private String from;
        private String to;
    }
}
