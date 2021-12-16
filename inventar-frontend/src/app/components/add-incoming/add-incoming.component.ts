import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Incoming } from 'src/app/models/Incoming';
import { Spending } from 'src/app/models/Spending';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { CategoriesService } from 'src/app/services/categories.service';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { TOASTER_POSITION } from 'src/environments/environment';

@Component({
  selector: 'app-add-incoming',
  templateUrl: './add-incoming.component.html',
  styleUrls: ['./add-incoming.component.css']
})
export class AddIncomingComponent implements OnInit {
  buttonText = "Shto Anetar";
  private mode = '';
  private id = '';
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public incomings: Incoming, public dialogRef: MatDialogRef<AddIncomingComponent>, private formBuilder: FormBuilder, private incomingsService: IncomingsService, private categoryService: CategoriesService) {}
  formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    spendingCategoryID: ['', Validators.required],
    incoming: ['', Validators.required]
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

  get incoming() {
    return this.formGroup.controls['incoming'];
  }

  public categories: SpendingCategory[] = [];

  ngOnInit(): void {
    this.getCategories();
    if(this.incomings) {
      this.mode = 'edit';
      this.id = this.incomings.id;
      this.buttonText = 'Perditeso Anetar';
      this.formGroup.patchValue(this.incomings);
    }else{
      this.mode = 'add';
    }
  }

  private getCategories(): void {
    this.categoryService.findAll(0, 100, "incomings").subscribe((response: any) => {
      this.categories = response.body.categories;
    })
  }

  add(): void {
    if(this.formGroup.valid){
      if(this.mode === 'edit') {
        this.incomings.name = this.name.value;
        this.incomings.description = this.description.value;
        this.incomings.incoming = this.incoming.value;
        this.incomingsService.update(this.incomings).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u perditesua me sukses", "Sukses!", {
            timeOut: 7000, positionClass: TOASTER_POSITION
          });
        });
      } else {
        this.incomingsService.save(this.formGroup.value).subscribe((res:any) => {
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

}
