import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Category, CategoryType, Income } from 'src/app/models/models';
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
  public savingEntity: boolean = false;
  private categoriesSubscription: Subscription = null;
  private updateSubscription: Subscription = null;
  private saveSubscription: Subscription = null;
  public formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    categoryID: ['', Validators.required],
    incoming: ['', Validators.required]
  });  
  constructor(
    @Inject(MAT_DIALOG_DATA) public income: Income,
    public sharedService: SharedService, 
    private toaster: ToastrService,  
    private dialogRef: MatDialogRef<AddIncomingComponent>, 
    private formBuilder: FormBuilder, 
    private incomingsService: IncomingsService, 
    private categoryService: CategoriesService
  ) {}

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
    this.categoriesSubscription?.unsubscribe();
    this.categoriesSubscription = this.categoryService.findAll(0, 100, CategoryType.INCOME).subscribe((response: any) => {
      this.categories = response.body.categories;
      if(this.editMode) {
        this.formGroup.patchValue(this.income);
      }
    });
  }

  add(): void {
    if(this.formGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.updateSubscription?.unsubscribe();
        this.savingEntity = true;
        this.updateSubscription = this.incomingsService.update(this.income.id, this.formGroup.value).subscribe(() => {
          this.closeDialog(true);  
          this.savingEntity = false;
          this.toaster.success("Income updated with success", "Success", TOASTER_CONFIGURATION);
        });
      } else if(!this.savingEntity){
        this.saveSubscription?.unsubscribe();
        this.savingEntity = true;
        this.saveSubscription = this.incomingsService.save(this.formGroup.value).subscribe(() => {
          this.closeDialog(true);
          this.savingEntity = false;
          this.toaster.success("A new Income has been inserted", "Success", TOASTER_CONFIGURATION);    
        });
      }
    }
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
    this.categoriesSubscription?.unsubscribe();
  }

}
