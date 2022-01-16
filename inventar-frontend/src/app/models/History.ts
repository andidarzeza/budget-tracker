export interface History {
    id: string;
    date: Date;
    action: EntityAction;
    lastModifiedDate: Date;
    entity: EntityType;
    user: string;
    message: string;
}

export enum EntityAction {
    CREATE = "create", 
    DELETE = "delete",
    UPDATE = "update",
    AUTHENTICATION = "authentication",
    REGISTRATION = "registration",
    EXPORT = "export"
}


export enum EntityType {
    INCOME = "income",
    EXPENSE = "expense",
    CATEGORY = "category",
    DASHBOARD = "dashboard"
}