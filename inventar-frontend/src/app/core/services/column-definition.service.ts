import { Injectable } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';
import { TableEntity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ColumnDefinitionService {
  private categoryColumnDefinition: ColumnDefinition[] = [
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
  private incomeColumnDefinition: ColumnDefinition[] = [
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
  private expenseColumnDefinition: ColumnDefinition[] = [
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

  private historyColumnDefinition: ColumnDefinition[] = [
    {
      column: 'date',
      label: 'Date',
      type: 'date'
    },
    {
      column: 'action',
      label: 'Action',
      type: 'string'
    },
    {
      column: 'entity',
      label: 'Entity',
      type: 'string'
    },
    {
      column: 'message',
      label: 'Message',
      type: 'string'
    },
    {
      column: 'user',
      label: 'User',
      type: 'string'
    },
    {
      column: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];

  private columnDefinitions = new Map<TableEntity, ColumnDefinition[]>()
    .set("EXPENSE", this.expenseColumnDefinition)
    .set("INCOME", this.incomeColumnDefinition)
    .set("CATEGORY", this.categoryColumnDefinition)
    .set("HISTORY", this.historyColumnDefinition);

  constructor() { }

  get(tableEntity: TableEntity): ColumnDefinition[] {
    return this.columnDefinitions.get(tableEntity);
  }

}
