import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Income, ResponseWrapper } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { buildParams } from 'src/app/utils/param-bulder';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.css']
})
export class AddIncomeComponent extends Unsubscribe implements OnInit {
  public savingEntity: boolean = false;
  loadingData = false;
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
  ) {
    super();
  }

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
    this.formGroup.get("currency").setValue(this.baseCurrency)
    this.getCategories();
  }
  
  private getCategories(): void {
    this.loadingData = true;
    this.categoryService
      .findAll(buildParams(0, 99999).append("categoryType", CategoryType.INCOME).append("account", this.accountService.getAccount()))
      .pipe(
        takeUntil(this.unsubscribe$),
        map(response => this.categories = response.data),
        map(() => this.loadingData = false),
        filter(() => this.editMode),
        mergeMap(() => this.getIncome())
      )
      .subscribe();
  }

  private getIncome(): Observable<any> {
    this.loadingData = true;
    return this.incomeService
      .findOne(this.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        map((income) => this.formGroup.patchValue(income)),
        map(() => this.loadingData = false)
      )
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.loadingData = true;
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .update(this.income.id, payload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.onSaveSuccess("Income updated with success");
          });
      } else if(!this.savingEntity){
        this.loadingData = true;
        this.savingEntity = true;
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .save(payload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.onSaveSuccess("A new Income has been inserted")
          });
      }
    } else if(this.formGroup.invalid) {
      this.toaster.error("Please, fill in all required fields.", "Error", TOASTER_CONFIGURATION);
    }
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);  
    this.loadingData = false;
    this.savingEntity = false;
    this.toaster.success(message, "Success", TOASTER_CONFIGURATION);
  }

  get id() {
    return this.income?.id;
  }

}
