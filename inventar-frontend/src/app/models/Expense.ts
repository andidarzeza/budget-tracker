export interface Expense {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    moneySpent: number;
    name: string;
    description: string;
    categoryID: string;
    user: string;
}