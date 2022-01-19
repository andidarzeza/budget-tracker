import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Expense } from 'src/app/models/Expense';
import { Category } from 'src/app/models/Category';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-spending',
  templateUrl: './add-spending.component.html',
  styleUrls: ['./add-spending.component.css']
})
export class AddSpendingComponent implements OnInit, OnDestroy {
  private mode = 'add';
  public savingEntity = false;
  private categoriesSubscription: Subscription = null;
  private saveSubscription: Subscription = null;
  private updateSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public expense: Expense, public dialogRef: MatDialogRef<AddSpendingComponent>, private formBuilder: FormBuilder, private spendingService: SpendingService, private categoryService: CategoriesService) {}
  formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    categoryID: ['', Validators.required],
    moneySpent: ['', Validators.required]
  });

  get name(){
    return this.formGroup.controls['name'];
  }

  get description(){
    return this.formGroup.controls['description'];
  }

  get category(){
    return this.formGroup.controls['categoryID'];
  }

  get moneySpent() {
    return this.formGroup.controls['moneySpent'];
  }

  public categories: Category[] = [];

  ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.unsubscribe(this.categoriesSubscription);
    this.categoriesSubscription = this.categoryService.findAll(0, 100, "spendings").subscribe((response: any) => {
      this.categories = response.body.categories;
      if(this.expense) {
        this.mode = 'edit';
        this.formGroup.patchValue(this.expense);
      }
    })
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.mode === 'edit') {
        this.savingEntity = true;
        this.unsubscribe(this.updateSubscription);
        this.updateSubscription = this.spendingService.update(this.expense.id, this.formGroup.value).subscribe(() => {
          this.closeDialog(true);
          this.savingEntity = false;
          this.toaster.success("Expense updated successfully", "Success", TOASTER_CONFIGURATION);
        });
      } else if(!this.savingEntity) {
        this.unsubscribe(this.saveSubscription);
        this.savingEntity = true;
        this.saveSubscription = this.spendingService.save(this.formGroup.value).subscribe(() => {
          this.closeDialog(true);  
          this.savingEntity = false;
          this.toaster.success("A new Expense has been inserted", "Success", TOASTER_CONFIGURATION);    
        });
      }
    }
  }

  closeDialog(update: any): void {
    this.dialogRef.close(update);
  }

  private unsubscribe(subscription: Subscription): void {
    if(subscription) {
      subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe(this.categoriesSubscription);
    this.unsubscribe(this.updateSubscription);
    this.unsubscribe(this.saveSubscription);
  }
}
