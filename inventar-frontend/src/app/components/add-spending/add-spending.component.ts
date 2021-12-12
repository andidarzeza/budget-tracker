import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IAssociate } from 'src/app/models/IAssociate';
import { Spending } from 'src/app/models/Spending';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';

@Component({
  selector: 'app-add-spending',
  templateUrl: './add-spending.component.html',
  styleUrls: ['./add-spending.component.css']
})
export class AddSpendingComponent implements OnInit {
  buttonText = "Shto Anetar";
  private mode = '';
  private id = '';
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
    this.categoryService.findAll(0, 100).subscribe((response: any) => {
      this.categories = response.body.categories;
    })
  }

  add(): void {
    if(this.formGroup.valid){
      if(this.mode === 'edit') {
        this.spending.name = this.name.value;
        this.spending.description = this.description.value;
        this.spending.moneySpent = this.moneySpent.value;
        this.spendingService.update(this.spending).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u perditesua me sukses", "Sukses!", {
            timeOut: 7000
          });
        });
      } else {
        this.spendingService.save(this.formGroup.value).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u shtua me sukses", "Sukses!", {
            timeOut: 7000
          });    
        });
      }
    }
  }

  closeDialog(update: any): void {
    this.dialogRef.close(update);
  }

}
