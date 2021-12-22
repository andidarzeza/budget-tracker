import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Incoming } from 'src/app/models/Incoming';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { CategoriesService } from 'src/app/services/categories.service';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-incoming',
  templateUrl: './add-incoming.component.html',
  styleUrls: ['./add-incoming.component.css']
})
export class AddIncomingComponent implements OnInit, OnDestroy {
  private mode = 'add';
  savingEntity = false;
  private categoriesSubscription: Subscription = null;
  private updateSubscription: Subscription = null;
  private saveSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public income: Incoming, public dialogRef: MatDialogRef<AddIncomingComponent>, private formBuilder: FormBuilder, private incomingsService: IncomingsService, private categoryService: CategoriesService) {}
  formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    categoryID: ['', Validators.required],
    incoming: ['', Validators.required]
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

  get incoming() {
    return this.formGroup.controls['incoming'];
  }

  public categories: SpendingCategory[] = [];

  ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.unsubscribe(this.categoriesSubscription);
    this.categoriesSubscription = this.categoryService.findAll(0, 100, "incomings").subscribe((response: any) => {
      this.categories = response.body.categories;
      if(this.income) {
        this.mode = 'edit';
        console.log(this.income);
        
        this.formGroup.patchValue(this.income);
      }
    });
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.mode === 'edit') {
        this.unsubscribe(this.updateSubscription);
        this.savingEntity = true;
        console.log(this.income.id);
        
        this.updateSubscription = this.incomingsService.update(this.income.id, this.formGroup.value).subscribe(() => {
          this.closeDialog(true);  
          this.savingEntity = false;
          this.toaster.success("Income updated with success", "Success", TOASTER_CONFIGURATION);
        });
      } else if(!this.savingEntity){
        this.unsubscribe(this.saveSubscription);
        this.savingEntity = true;
        this.saveSubscription = this.incomingsService.save(this.formGroup.value).subscribe(() => {
          this.closeDialog(true);
          this.savingEntity = false;
          this.toaster.success("A new Income has been inserted", "Success", TOASTER_CONFIGURATION);    
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
    this.unsubscribe(this.saveSubscription);
    this.unsubscribe(this.updateSubscription);
    this.unsubscribe(this.categoriesSubscription);
  }

}
