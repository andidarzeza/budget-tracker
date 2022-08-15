import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Income, ResponseWrapper } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { buildParams } from 'src/app/utils/param-bulder';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.css']
})
export class AddIncomeComponent implements OnInit, OnDestroy {
  public savingEntity: boolean = false;
  private _subject = new Subject();
  public formGroup: FormGroup = this.formBuilder.group({
    description:  [''],
    categoryID:   ['', Validators.required],
    incoming:     ['', Validators.required],
    currency:     ['', Validators.required]
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public income: Income,
    public sharedService: SharedService, 
    private toaster: ToastrService,  
    private dialogRef: MatDialogRef<AddIncomeComponent>, 
    private formBuilder: FormBuilder, 
    private incomeService: IncomeService, 
    private categoryService: CategoriesService,
    private accountService: AccountService
  ) {}

  public baseCurrency = localStorage.getItem("baseCurrency");

  currencies = CURRENCIES;
  public entity: EntityType = EntityType.INCOME;

  get name(){
    return this.formGroup.controls['name'];
  }

  get description(){
    return this.formGroup.controls['description'];
  }

  get category(){
    return this.formGroup.controls['categoryID'];
  }

  get incomeValue() {
    return this.formGroup.controls['incoming'];
  }

  get editMode() {
    return this.income != null && this.income != undefined;
  }

  public categories: Category[] = [];

  ngOnInit(): void {
    this.getCategories();
  }
  
  private getCategories(): void {
    this.categoryService
      .findAll(buildParams(0, 99999).append("categoryType", CategoryType.INCOME).append("account", this.accountService.getAccount()))
      .pipe(takeUntil(this._subject))
      .subscribe((response: ResponseWrapper) => {
        this.formGroup.get("currency").setValue(this.baseCurrency);
        this.categories = response.data;
        if(this.editMode) {
          this.formGroup.patchValue(this.income);
        }
    });
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .update(this.income.id, payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.onSaveSuccess("Income updated with success");
          });
      } else if(!this.savingEntity){
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .save(payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.onSaveSuccess("A new Income has been inserted")
          });
      }
    }
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);  
    this.savingEntity = false;
    this.toaster.success(message, "Success", TOASTER_CONFIGURATION);
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

}
