import { ENTITIES, EntityAction, EntityType, ENTITY_ACTIONS } from "src/app/models/models";
import { FilterOptions } from "src/app/shared/base-table/table-actions/filter/filter.models";

export const historyFilters: FilterOptions[] = [
  {
    field: "action",
    label: "Action",
    type: "select",
    matSelectOptions: getActions()
  },
  {
    field: "entity",
    label: "Entity",
    type: "select",
    matSelectOptions: getEntities()
  },
  {
    field: "message",
    label: "Message",
    type: "text"
  }
];

function getActions() {
  return {
    options: ENTITY_ACTIONS.map((action: EntityAction) => {
      return {
        display: action.toUpperCase(),
        value: action.toUpperCase()
      }
    }),
    displayBy: "display",
    valueBy: "value"
  }
}

function getEntities() {
  return {
    options: ENTITIES.map((action: EntityType) => {
      return {
        display: action.toUpperCase(),
        value: action.toUpperCase()
      }
    }),
    displayBy: "display",
    valueBy: "value"
  }
}