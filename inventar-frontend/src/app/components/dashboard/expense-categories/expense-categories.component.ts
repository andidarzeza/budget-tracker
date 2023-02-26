import { Component, Input } from '@angular/core';

@Component({
  selector: 'expense-categories',
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.css']
})
export class ExpenseCategoriesComponent {

  @Input() expenseCategoriesData: any[];

  constructor() { }

}
