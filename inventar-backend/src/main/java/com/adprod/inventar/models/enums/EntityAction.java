package com.adprod.inventar.models.enums;

public enum EntityAction {
    CREATE {
        @Override
        public String toString() {
            return "created";
        }
    },
    DELETE {
        @Override
        public String toString() {
            return "deleted";
        }
    },
    UPDATE {
        @Override
        public String toString() {
            return "updated";
        }
    },
    AUTHENTICATION {
        @Override
        public String toString() {
            return "logged in";
        }
    },
    REGISTRATION {
        @Override
        public String toString() {
            return "registred";
        }
    },
    EXPORT {
        @Override
        public String toString() {
            return "exported";
        }
    }
}
