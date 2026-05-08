import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Category, Expense } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css'],
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule],
})
export class ExpenseDetailComponent extends Unsubscribe implements OnInit, OnChanges, OnDestroy {
  private readonly expenseService = inject(ExpenseService);
  readonly sharedService = inject(SharedService);
  private readonly categoryService = inject(CategoriesService);

  @Input() expenseViewId: string;
  @Output() onCloseAction = new EventEmitter<void>();
  expense: Expense;
  expenseCategory: Category;

  ngOnInit(): void {
    this.getExpense();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.['expenseViewId']?.firstChange) {
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
        }),
      )
      .subscribe((category: Category) => (this.expenseCategory = category));
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.expenseViewId = '';
    this.expense = null;
  }

  get category() {
    return this.expenseCategory?.category ?? '-';
  }

  get categoryIcon() {
    return this.expenseCategory?.icon;
  }
}
