import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Category, Income } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/categories.service';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-income-details',
  templateUrl: './income-details.component.html',
  styleUrls: ['./income-details.component.css']
})
export class IncomeDetailsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() incomeViewId: string;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();
  private income: Income;
  private incomeCategory: Category;
  private _subject = new Subject();
  
  constructor(
    private incomeService: IncomingsService,
    public sharedService: SharedService,
    private categoryService: CategoriesService
  ) {}

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
        takeUntil(this._subject),
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
    this._subject.next();
    this._subject.complete();
  }

  get incomeName() {
    return this.income?.name ?? "-";
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
