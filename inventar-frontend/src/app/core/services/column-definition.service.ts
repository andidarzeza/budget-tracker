import { Injectable } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';
import { TableEntity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ColumnDefinitionService {
  categoryColumnDefinition: ColumnDefinition[] = [
    {
      column: 'lastModifiedDate',
      label: 'Last Modified Date',
      type: 'date'
    },
    {
      column: 'icon',
      label: 'Icon',
      type: 'string'
    },
    {
      column: 'category',
      label: 'Category',
      type: 'string'
    },
    {
      column: 'description',
      label: 'Description',
      type: 'string'
    },
    {
      column: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];
  incomeColumnDefinition: ColumnDefinition[] = [
    {
      column: 'createdTime',
      label: 'Created Time',
      type: 'date'
    },
    {
      column: 'category',
      label: 'Category',
      type: 'string'
    },
    {
      column: 'description',
      label: 'Description',
      type: 'string'
    },
    {
      column: 'incoming',
      label: 'Income',
      type: 'currency'
    },
    {
      column: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];
  expenseColumnDefinition: ColumnDefinition[] = [
    {
      column: 'createdTime',
      label: 'Created Time',
      type: 'date'
    },
    {
      column: 'category',
      label: 'Category',
      type: 'string'
    },
    {
      column: 'description',
      label: 'Description',
      type: 'string'
    },
    {
      column: 'moneySpent',
      label: 'Expense',
      type: 'currency'
    },
    {
      column: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];

  columnDefinitions = new Map<TableEntity, any>()
    .set("EXPENSE", this.expenseColumnDefinition)
    .set("INCOME", this.incomeColumnDefinition)
    .set("CATEGORY", this.categoryColumnDefinition);

  constructor() { }
}
