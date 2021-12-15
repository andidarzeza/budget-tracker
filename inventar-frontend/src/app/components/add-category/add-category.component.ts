import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IAssociate } from 'src/app/models/IAssociate';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { AssociateService } from 'src/app/services/associate.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_POSITION } from 'src/environments/environment';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  buttonText = "Shto Anetar";
  private mode = '';
  private id = '';
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AddCategoryComponent>, private formBuilder: FormBuilder, private categoriesService: CategoriesService) {}
  categoryGroup: FormGroup = this.formBuilder.group({
    category: ['', Validators.required],
    description: ['', Validators.required],
    icon: [null, Validators.required]
  });

  get category(){
    return this.categoryGroup.controls['category'];
  }

  get description(){
    return this.categoryGroup.controls['description'];
  }

  get icon(){
    return this.categoryGroup.controls['icon'];
  }

  ngOnInit(): void {
    console.log(this.data.spendingCategory);
    
    if(this.data.spendingCategory) {
      this.mode = 'edit';
      this.id = this.data.spendingCategory.id;
      this.buttonText = 'Perditeso Anetar';
      this.categoryGroup.patchValue(this.data.spendingCategory);
    }else{
      this.mode = 'add';
    }
  }

  add(): void {
    if(this.categoryGroup.valid){
      if(this.mode === 'edit') {
        this.data.spendingCategory.category = this.category.value;
        this.data.spendingCategory.description = this.description.value;
        this.data.spendingCategory.icon = this.icon.value;
        const payload = this.data.spendingCategory;
        payload['categoryType'] = this.data.categoriesType;
        this.categoriesService.update(payload).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u perditesua me sukses", "Sukses!", {
            timeOut: 7000, positionClass: TOASTER_POSITION
          });
        });
      } else {
        const payload = this.categoryGroup.value;
        payload['categoryType'] = this.data.categoriesType;
        this.categoriesService.save(payload).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u shtua me sukses", "Sukses!", {
            timeOut: 7000, positionClass: TOASTER_POSITION
          });    
        });
      }
    }
  }

  closeDialog(update: any): void {
    this.dialogRef.close(update);
  }

  onIconSelect(icon: string): void {
    this.icon.setValue(icon);
  }
}
