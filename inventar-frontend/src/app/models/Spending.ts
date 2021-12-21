export interface Spending {
    id: string;
    createdTime: Date;
    moneySpent: number;
    name: string;
    description: string;
    spendingCategoryID: string;
    user: string;
}