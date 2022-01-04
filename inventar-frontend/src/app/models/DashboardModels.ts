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
