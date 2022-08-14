import { Component, Input } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'expense-categories',
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.css']
})
export class ExpenseCategoriesComponent {

  @Input() expenseCategoriesData: any[];

  constructor(
    public sharedService: SharedService
  ) { }

}
