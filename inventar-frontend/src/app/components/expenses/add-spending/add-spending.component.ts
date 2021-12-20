import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Spending } from 'src/app/models/Spending';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { TOASTER_POSITION } from 'src/environments/environment';

@Component({
  selector: 'app-add-spending',
  templateUrl: './add-spending.component.html',
  styleUrls: ['./add-spending.component.css']
})
export class AddSpendingComponent implements OnInit, OnDestroy {
  buttonText = "Shto Anetar";
  private mode = '';
  private id = '';
  public savingEntity = false;
  private categoriesSubscription: Subscription = null;
  private saveSubscription: Subscription = null;
  private updateSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public spending: Spending, public dialogRef: MatDialogRef<AddSpendingComponent>, private formBuilder: FormBuilder, private spendingService: SpendingService, private categoryService: CategoriesService) {}
  formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    spendingCategoryID: ['', Validators.required],
    moneySpent: ['', Validators.required]
  });

  get name(){
    return this.formGroup.controls['name'];
  }

  get description(){
    return this.formGroup.controls['description'];
  }

  get category(){
    return this.formGroup.controls['spendingCategoryID'];
  }

  get moneySpent() {
    return this.formGroup.controls['moneySpent'];
  }

  public categories: SpendingCategory[] = [];

  ngOnInit(): void {
    this.getCategories();
    if(this.spending) {
      this.mode = 'edit';
      this.id = this.spending.id;
      this.buttonText = 'Perditeso Anetar';
      this.formGroup.patchValue(this.spending);
    }else{
      this.mode = 'add';
    }
  }

  private getCategories(): void {
    this.unsubscribe(this.categoriesSubscription);
    this.categoriesSubscription = this.categoryService.findAll(0, 100, "spendings").subscribe((response: any) => {
      this.categories = response.body.categories;
    })
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.mode === 'edit') {
        this.spending.name = this.name.value;
        this.spending.description = this.description.value;
        this.spending.moneySpent = this.moneySpent.value;
        this.unsubscribe(this.updateSubscription);
        this.savingEntity = true;
        this.updateSubscription = this.spendingService.update(this.spending).subscribe(() => {
          this.closeDialog(true);
          this.savingEntity = false;
          this.toaster.success("Expense updated successfully", "Success", {
            timeOut: 7000, positionClass: TOASTER_POSITION
          });
        });
      } else if(!this.savingEntity) {
        this.unsubscribe(this.saveSubscription);
        this.savingEntity = true;
        this.saveSubscription = this.spendingService.save(this.formGroup.value).subscribe(() => {
          this.closeDialog(true);  
          this.savingEntity = false;
          this.toaster.success("A new Expense has been inserted", "Success", {
            timeOut: 7000, positionClass: TOASTER_POSITION
          });    
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
