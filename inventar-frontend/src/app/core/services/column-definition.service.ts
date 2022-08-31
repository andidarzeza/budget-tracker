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
      type: 'date'
    },
    {
      column: 'icon',
      type: 'string'
    },
    {
      column: 'category',
      type: 'string'
    },
    {
      column: 'description',
      type: 'string'
    },
    {
      column: 'actions',
      type: 'actions'
    }
  ];
  incomeColumnDefinition: ColumnDefinition[] = [
    {
      column: 'createdTime',
      type: 'date'
    },
    {
      column: 'category',
      type: 'string'
    },
    {
      column: 'description',
      type: 'string'
    },
    {
      column: 'incoming',
      type: 'currency'
    },
    {
      column: 'actions',
      type: 'actions'
    }
  ];
  expenseColumnDefinition: ColumnDefinition[] = [
    {
      column: 'createdTime',
      type: 'date'
    },
    {
      column: 'category',
      type: 'string'
    },
    {
      column: 'description',
      type: 'string'
    },
    {
      column: 'moneySpent',
      type: 'currency'
    },
    {
      column: 'actions',
      type: 'actions'
    }
  ];

  columnDefinitions = new Map<TableEntity, any>()
    .set("EXPENSE", this.expenseColumnDefinition)
    .set("INCOME", this.incomeColumnDefinition)
    .set("CATEGORY", this.categoryColumnDefinition);

  constructor() { }
}
