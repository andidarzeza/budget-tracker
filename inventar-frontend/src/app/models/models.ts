export interface Account {
    id: string;
}

/** A movement of money between two wallets (e.g. ATM withdrawal: bank → cash). */
export interface Transfer {
    id?: string;
    fromWalletId: string;
    toWalletId: string;
    amountFrom: number;
    amountTo?: number;
    fromCurrency?: string;
    toCurrency?: string;
    description?: string;
    account?: string;
    createdTime?: Date;
}

/** A bank account or cash holding. Money now lives here, not on the account. */
export type WalletType = 'BANK' | 'CASH';

export interface Wallet {
    id?: string;
    name: string;
    type: WalletType;
    currency: string;
    balance: number;
    icon?: string;
    archived?: boolean;
    account?: string;
    user?: string;
    createdTime?: Date;
    lastModifiedDate?: Date;
}

export interface Category {
    id: string;
    icon: string;
    category: string;
    lastModifiedDate: Date;
    description: string;
    categoryType: string;
    /** Pre-filled as the amount when this category is picked. */
    defaultAmount?: number | null;
    user: string;
}

export interface CurrencyTotalDTO {
    _id: string;
    total: number;
}

export interface DashboardDTO {
    /** Per-currency income totals; backend omits zero amounts. */
    incomeTotalsByCurrency?: CurrencyTotalDTO[];
    /** Per-currency expense totals; backend omits zero amounts. */
    expenseTotalsByCurrency?: CurrencyTotalDTO[];
    /** Per-category expense breakdown for the period, sorted desc by total. */
    expensesInfo?: ExpenseInfoDTO[];
    /** Per-category income breakdown for the period, sorted desc by total. */
    incomesInfo?: IncomeInfoDTO[];
}

export interface TimelineIncomeDTO {
    _id: string;
    income: number;
    currency: string;
}


export interface TimelineExpenseDTO {
    _id: string;
    dailyExpense: number;
    currency: string;
}

export interface ExpenseInfoDTO {
	_id: string;
	icon: string;
	total: number;
	/** ISO currency code; rows are split per currency (cross-currency sums are not additive). */
	currency?: string;
}

export interface IncomeInfoDTO {
	_id: string;
	total: number;
	/** ISO currency code; rows are split per currency (cross-currency sums are not additive). */
	currency?: string;
}

export interface Expense {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    moneySpent: number;
    description: string;
    categoryID: string;
    user: string;
    currency: string;
    /** Money source this expense was paid from. */
    walletId?: string;
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
    DASHBOARD = "dashboard",
    BALANCE = "balance"
}

export const ENTITIES = [
    EntityType.INCOME, EntityType.EXPENSE,
    EntityType.CATEGORY, EntityType.DASHBOARD
]

export interface IConfiguration {
    darkMode: boolean,
    animationMode: boolean
    baseCurrency: string;
}

export interface Income {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    incoming: number;
    description: string;
    categoryID: string;
    currency?: string;
    /** Money source this income was deposited into. */
    walletId?: string;
}

export interface User {
    username: string;
    firstName: string;
    lastName: string;
    /** JWT bearer token returned by the backend's `LoginResponse#token`. */
    token: string;
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

export interface UserRequest {
    username: string,
    password: string,
    firstName: string,
    lastName: string
}

export type RangeType = "DAY" | "WEEK" | "MONTH" | "YEAR" | "MAX" | "CUSTOM";

export interface Project {
    id?: string;
    name: string;
    description?: string;
    targetAmount: number;
    targetCurrency: string;
    icon?: string;
    archived?: boolean;
    createdTime?: Date;
    lastModifiedDate?: Date;
    user?: string;
    account?: string;
}

export interface Contribution {
    id?: string;
    projectId?: string;
    amount: number;
    currency?: string;
    description?: string;
    createdTime?: Date;
    lastModifiedDate?: Date;
    user?: string;
    account?: string;
    /** Money source the contribution was funded from. */
    walletId?: string;
}

/** Backend `ProjectViewDTO`: a project plus its current per-currency saved totals. */
export interface ProjectView {
    project: Project;
    totalsByCurrency: CurrencyTotalDTO[];
}

export interface SimplifiedAccount {
    id: string;
    title: string;
}

export type ColumnType = "string" | "double" | "date" | "actions" | "currency";

export interface ColumnDefinition {
    column: string;
    label: string;
    type: ColumnType;
}

export type Period = {
    from: Date,
    to: Date
}