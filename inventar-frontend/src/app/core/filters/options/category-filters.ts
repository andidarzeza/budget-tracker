import { FilterOptions } from "src/app/shared/base-table/table-actions/filter/filter.models";

export const categoryFilters: FilterOptions[] = [
  {
    field: "category",
    label: "Category",
    type: "text"
  },
  {
    field: "description",
    label: "Description",
    type: "text"
  }
];