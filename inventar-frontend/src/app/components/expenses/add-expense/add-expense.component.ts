import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Expense, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';
import { inOutAnimation } from 'src/app/animations';



@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
  animations: [inOutAnimation]
})
export class AddExpenseComponent implements OnInit, OnDestroy {

  public savingEntity = false;
  private _subject = new Subject();
  public entity: EntityType = EntityType.EXPENSE;
  public categories: Category[] = [];
  public baseCurrency = localStorage.getItem("baseCurrency");
  loadingData = false;
  constructor(
    public sharedService: SharedService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public expense: Expense,
    public dialogRef: MatDialogRef<AddExpenseComponent>,
    private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoriesService,
    public accountService: AccountService
  ) {}
  
  formGroup: FormGroup = this.formBuilder.group({
    description: [''],
    categoryID: ['', Validators.required],
    moneySpent: ['', Validators.required],
    currency: ['', Validators.required]
  });

  currencies = CURRENCIES;

  ngOnInit(): void {
    this.formGroup.get("currency").setValue(this.baseCurrency);
    this.getCategories();
  }

  private getExpense(): Observable<any> {
    this.loadingData = true;
    return this.expenseService
      .findOne(this.id)
      .pipe(
        takeUntil(this._subject),
        map(expense => this.formGroup.patchValue(expense)),
        map(() => this.loadingData = false)
      )
  }

  private getCategories(): void {
    this.loadingData = true;
    this.categoryService
      .findAll(buildParams(0, 1000).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService.getAccount()))
      .pipe(
        takeUntil(this._subject),
        map((response) => this.categories = response.data),
        map(() => this.loadingData = false),
        filter(() => this.editMode),
        mergeMap(() => this.getExpense())
      )
      .subscribe();
  }

  public closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
  
  add(): void {
    this.loadingData = true;
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .update(this.expense.id, payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.closeDialog(true);
            this.loadingData = false
            this.savingEntity = false;
            this.toaster.success("Expense updated successfully", "Success", TOASTER_CONFIGURATION);
          });
      } else if(!this.savingEntity) {
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .save(payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.closeDialog(true);  
            this.savingEntity = false;
            this.toaster.success("A new Expense has been inserted", "Success", TOASTER_CONFIGURATION);    
          });
      }
    }
  }

  get editMode() {
    return this.expense !== undefined;
  }

  get id() {
    return this.expense?.id
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
