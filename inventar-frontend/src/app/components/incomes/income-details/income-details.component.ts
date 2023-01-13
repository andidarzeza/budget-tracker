import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Category, Income } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'app-income-details',
  templateUrl: './income-details.component.html',
  styleUrls: ['./income-details.component.css']
})
export class IncomeDetailsComponent extends Unsubscribe implements OnInit, OnChanges, OnDestroy {

  @Input() incomeViewId: string;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();
  private income: Income;
  private incomeCategory: Category;
  
  constructor(
    private incomeService: IncomeService,
    public sharedService: SharedService,
    private categoryService: CategoriesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getIncome();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes?.incomeViewId.firstChange) {      
      this.getIncome();
    }
  }

  getIncome(): void {
    this.incomeService
      .findOne(this.incomeViewId)
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap((incomeRespone: Income) => {          
          this.income = incomeRespone;
          return this.categoryService.findOne(this.income.categoryID);
        }))
      .subscribe((category: Category) => this.incomeCategory = category);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    this.incomeViewId = "";
    this.income = null;
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
    return this.incomeCategory?.category ?? "-";
  }

  get incomeDescription() {
    return this.income?.description ?? "-";
  }

  get categoryIcon() {
    return this.incomeCategory?.icon;
  }
}
