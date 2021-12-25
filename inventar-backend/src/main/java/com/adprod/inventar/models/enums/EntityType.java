package com.adprod.inventar.models.enums;

public enum EntityType {
    INCOME {
        @Override
        public String toString() {
            return "Income";
        }
    },
    EXPENSE {
        @Override
        public String toString() {
            return "Expense";
        }
    },
    CATEGORY {
        @Override
        public String toString() {
            return "Category";
        }
    },
    DASHBOARD {
        @Override
        public String toString() {
            return "Dashboard";
        }
    },
    USER {
        @Override
        public String toString() {
            return "User";
        }
    }
}
