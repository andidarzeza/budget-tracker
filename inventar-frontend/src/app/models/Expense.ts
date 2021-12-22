export interface Expense {
    id: string;
    createdTime: Date;
    moneySpent: number;
    name: string;
    description: string;
    categoryID: string;
    user: string;
}