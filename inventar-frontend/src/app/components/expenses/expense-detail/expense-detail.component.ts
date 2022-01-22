import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Expense } from 'src/app/models/Expense';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css']
})
export class ExpenseDetailComponent implements OnInit, OnChanges, OnDestroy {
  
  @Input() expenseViewId: string;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();
  expenseSubscription: Subscription;
  expense: Expense;
  
  constructor(
    private expenseService: SpendingService,
    public sharedService: SharedService
  ) {}
  
  ngOnInit(): void {
    this.getExpense();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes?.expenseViewId.firstChange) {
      this.getExpense();
    }
  }

  getExpense(): void {
    this.expenseSubscription?.unsubscribe();
    this.expenseSubscription = this.expenseService.findOne(this.expenseViewId).subscribe((response: any) => {
      this.expense = response.body;
    });
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    console.log("eee");
    
    this.expenseViewId = "";
    this.expense = null;
    this.expenseSubscription?.unsubscribe();
  }

}
