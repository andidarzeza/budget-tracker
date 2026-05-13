import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { mergeMap } from 'rxjs/operators';
import { Category, Income } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';

@Component({
  selector: 'app-income-details',
  templateUrl: './income-details.component.html',
  styleUrls: ['./income-details.component.css'],
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, IconButtonComponent],
})
export class IncomeDetailsComponent implements OnInit, OnChanges, OnDestroy {
  private readonly incomeService = inject(IncomeService);
  readonly sharedService = inject(SharedService);
  private readonly categoryService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() incomeViewId: string;
  @Output() onCloseAction = new EventEmitter<void>();

  private income: Income;
  private incomeCategory: Category;

  ngOnInit(): void {
    this.getIncome();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.incomeViewId.firstChange) {
      this.getIncome();
    }
  }

  ngOnDestroy(): void {
    this.incomeViewId = '';
    this.income = null;
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  get incomeCreatedTime() {
    return this.income?.createdTime;
  }

  get incomeLastModifiedDate() {
    return this.income?.lastModifiedDate;
  }

  get incomes() {
    return this.income?.incoming ?? 0;
  }

  get category() {
    return this.incomeCategory?.category ?? '-';
  }

  get incomeDescription() {
    return this.income?.description ?? '-';
  }

  get categoryIcon() {
    return this.incomeCategory?.icon;
  }

  private getIncome(): void {
    this.incomeService
      .findOne(this.incomeViewId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap((incomeResponse: Income) => {
          this.income = incomeResponse;
          return this.categoryService.findOne(this.income.categoryID);
        }),
      )
      .subscribe((category: Category) => (this.incomeCategory = category));
  }
}
