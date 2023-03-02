import { FilterOptions } from "src/app/shared/base-table/table-actions/filter/filter.models";

export const incomeFilters: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "select",
      matSelectOptions: undefined
    }, {
      field: "description",
      label: "Description",
      type: "text"
    },
    {
      field: "income",
      label: "Income",
      type: "number"
    }
  ]