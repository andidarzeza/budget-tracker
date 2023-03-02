import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Expense } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';
import { inOutAnimation } from 'src/app/animations';
import { Unsubscribe } from 'src/app/shared/unsubscribe';



@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
  animations: [inOutAnimation]
})
export class AddExpenseComponent extends Unsubscribe implements OnInit {

  public savingEntity = false;
  public entity: EntityType = EntityType.EXPENSE;
  public categories: Category[] = [];
  public baseCurrency = localStorage.getItem("baseCurrency");
  loadingData = false;
  constructor(
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public expense: Expense,
    public dialogRef: MatDialogRef<AddExpenseComponent>,
    private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoriesService,
    public accountService: AccountService
  ) {
    super();
  }
  
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
        takeUntil(this.unsubscribe$),
        map(expense => this.formGroup.patchValue(expense)),
        map(() => this.loadingData = false)
      )
  }

  private getCategories(): void {
    this.loadingData = true;
    this.categoryService
      .findAll(buildParams(0, 1000).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService.getAccount()))
      .pipe(
        takeUntil(this.unsubscribe$),
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
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.loadingData = true;
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .update(this.expense.id, payload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).pipe(takeUntil(this.unsubscribe$)).subscribe();
            this.closeDialog(true);
            this.loadingData = false
            this.savingEntity = false;
            this.toaster.success("Expense updated successfully", "Success", TOASTER_CONFIGURATION);
          });
      } else if(!this.savingEntity) {
        this.loadingData = true;
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .save(payload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).pipe(takeUntil(this.unsubscribe$)).subscribe();
            this.closeDialog(true);  
            this.savingEntity = false;
            this.toaster.success("A new Expense has been inserted", "Success", TOASTER_CONFIGURATION);
          });
      }
    } else if(this.formGroup.invalid) {
      this.toaster.error("Please, fill in all required fields.", "Error", TOASTER_CONFIGURATION);
    }
  }

  get editMode() {
    return this.expense !== undefined;
  }

  get id() {
    return this.expense?.id
  }

}
