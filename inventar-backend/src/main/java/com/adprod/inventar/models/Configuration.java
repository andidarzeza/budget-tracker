package com.adprod.inventar.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Configuration {
    @Id
    private String id;
    private boolean darkMode;
    private boolean animationMode;
    private String user;

    public Configuration(String id, boolean darkMode, boolean animationMode, String user) {
        this.id = id;
        this.darkMode = darkMode;
        this.animationMode = animationMode;
        this.user = user;
    }

    public Configuration() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isDarkMode() {
        return darkMode;
    }

    public void setDarkMode(boolean darkMode) {
        this.darkMode = darkMode;
    }

    public boolean isAnimationMode() {
        return animationMode;
    }

    public void setAnimationMode(boolean animationMode) {
        this.animationMode = animationMode;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
