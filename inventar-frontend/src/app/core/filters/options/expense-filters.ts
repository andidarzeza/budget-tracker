import { FilterOptions } from "src/app/shared/base-table/table-actions/filter/filter.models";

export const expenseFilters: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "select",
      matSelectOptions: undefined
    },
    {
      field: "description",
      label: "Description",
      type: "text"
    },
    {
      field: "expense",
      label: "Expense",
      type: "number"
    }
  ];