import { FilterOptions } from "src/app/shared/base-table/table-actions/filter/filter.models";
import { TableEntity } from "../models";
import { categoryFilters } from "./options/category-filters";
import { expenseFilters } from "./options/expense-filters";
import { historyFilters } from "./options/history-filters";
import { incomeFilters } from "./options/income-filters";

export const filterMap: Map<TableEntity, FilterOptions[]> = new Map<TableEntity, FilterOptions[]>([
    ["INCOME", incomeFilters],
    ["EXPENSE", expenseFilters],
    ["CATEGORY", categoryFilters],
    ["HISTORY", historyFilters]
]);