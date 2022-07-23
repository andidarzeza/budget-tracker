import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Category } from 'src/app/models/Category';
import { Expense } from 'src/app/models/Expense';
import { CategoriesService } from 'src/app/services/categories.service';
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
  expense: Expense;
  public expenseCategory: Category;
  
  private _subject = new Subject();
  
  constructor(
    private expenseService: SpendingService,
    public sharedService: SharedService,
    private categoryService: CategoriesService
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
    this.expenseService
      .findOne(this.expenseViewId)
      .pipe(
        takeUntil(this._subject),
        mergeMap((expenseResponse: any) => {
          this.expense = expenseResponse.body;
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
    this._subject.next();
    this._subject.complete();
  }

  get category() {
    return this.expenseCategory?.category ?? "-";
  }

  get categoryIcon() {
    return this.expenseCategory?.icon;
  }

}
