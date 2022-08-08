import { ChartType } from "chart.js";

export interface Account {
    id: string;
    balance: number;
}

export interface Category {
    id: string;
    icon: string;
    category: string;
    lastModifiedDate: Date;
    description: string;
    categoryType: string;
    user: string;
}

export interface ChartOptions {
    type?: ChartType;
    labels?: string[];
    data?: number[];
    colors?: string[];
    datasets?: any[];
    showGridLines?: boolean;
}
export interface DashboardDTO {
	dailyExpenses: DailyExpenseDTO[];
	averageDailyIncome: number;
	averageDailyExpenses: number;
	incomes: number;
	expenses: number;
	expensesInfo: ExpenseInfoDTO[];
	incomesInfo: IncomeInfoDTO[];
    increaseInIncome: number;
    increaseInExpense: number;
}

export interface ExpenseInfoDTO {
	_id: string;
	icon: string;
	total: number;
}

export interface IncomeInfoDTO {
	_id: string;
	total: number;
}

export interface DailyExpenseDTO {
	_id: string;
	dailyExpense: number;
}

export interface Expense {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    moneySpent: number;
    description: string;
    categoryID: string;
    user: string;
}

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

export const ENTITY_ACTIONS = [
    EntityAction.CREATE, EntityAction.DELETE, EntityAction.UPDATE,EntityAction.AUTHENTICATION,
    EntityAction.REGISTRATION, EntityAction.EXPORT
];

export enum EntityType {
    INCOME = "income",
    EXPENSE = "expense",
    CATEGORY = "category",
    DASHBOARD = "dashboard"
}

export const ENTITIES = [
    EntityType.INCOME, EntityType.EXPENSE,
    EntityType.CATEGORY, EntityType.DASHBOARD
]

export interface IConfiguration {
    darkMode: boolean,
    animationMode: boolean
}

export interface Income {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    incoming: number;
    description: string;
    categoryID: string;
}

export interface User {
    username: string;
    firstName: string;
    lastName: string;
    jwt: string;
}

export interface Theme {
    name: string;
    color: string;
    shadowedColor: string;
}

export enum CategoryType {
    EXPENSE="EXPENSE", INCOME="INCOME"
}

export interface ResponseWrapper {
    data: any[];
    count: number;
}