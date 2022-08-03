import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Expense } from 'src/app/models/models';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit, OnDestroy {

  public savingEntity = false;
  private _subject = new Subject();
  public entity: EntityType = EntityType.EXPENSE;
  
  constructor(
    public sharedService: SharedService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public expense: Expense,
    public dialogRef: MatDialogRef<AddExpenseComponent>,
    private formBuilder: FormBuilder,
    private spendingService: SpendingService,
    private categoryService: CategoriesService
  ) {}
  
  formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    categoryID: ['', Validators.required],
    moneySpent: ['', Validators.required]
  });

  public categories: Category[] = [];

  ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.categoryService
      .findAll(0, 1000, CategoryType.EXPENSE)
      .pipe(
        takeUntil(this._subject),
        map((response: any) => this.categories = response.body.categories),
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
        this.spendingService
          .update(this.expense.id, this.formGroup.value)
          .pipe(takeUntil(this._subject))
          .subscribe(() => {
            this.closeDialog(true);
            this.savingEntity = false;
            this.toaster.success("Expense updated successfully", "Success", TOASTER_CONFIGURATION);
          });
      } else if(!this.savingEntity) {
        this.savingEntity = true;
        this.spendingService
          .save(this.formGroup.value)
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
