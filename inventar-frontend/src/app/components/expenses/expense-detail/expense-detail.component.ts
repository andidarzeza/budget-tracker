import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Category, Expense } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css']
})
export class ExpenseDetailComponent extends Unsubscribe implements OnInit, OnChanges, OnDestroy {
  
  @Input() expenseViewId: string;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();
  expense: Expense;
  public expenseCategory: Category;
  
  
  constructor(
    private expenseService: ExpenseService,
    public sharedService: SharedService,
    private categoryService: CategoriesService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.getExpense();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes?.expenseViewId.firstChange) {
      this.getExpense();
    }
  }

  getExpense(): void {
    this.expenseService
      .findOne(this.expenseViewId)
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap((expense: Expense) => {
          this.expense = expense;
          return this.categoryService.findOne(this.expense.categoryID);
        }))
        .subscribe((category: Category) => this.expenseCategory = category);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    this.expenseViewId = "";
    this.expense = null;
  }

  get category() {
    return this.expenseCategory?.category ?? "-";
  }

  get categoryIcon() {
    return this.expenseCategory?.icon;
  }

}
