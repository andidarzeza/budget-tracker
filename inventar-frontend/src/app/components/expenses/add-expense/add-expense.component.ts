import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Expense, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';



@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit, OnDestroy {

  public savingEntity = false;
  private _subject = new Subject();
  public entity: EntityType = EntityType.EXPENSE;
  public categories: Category[] = [];
  public baseCurrency = localStorage.getItem("baseCurrency");
  
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
    this.getCategories();
  }

  private getCategories(): void {
    this.categoryService
      .findAll(buildParams(0, 1000).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService.getAccount()))
      .pipe(
        takeUntil(this._subject),
        map((response: ResponseWrapper) => {
          this.categories = response.data
          this.formGroup.get("currency").setValue(this.baseCurrency);
        }),
        filter(()=>this.editMode),
        map(() => this.formGroup.patchValue(this.expense))
      )
      .subscribe();
  }

  public closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
  
  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .update(this.expense.id, payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.closeDialog(true);
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

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
