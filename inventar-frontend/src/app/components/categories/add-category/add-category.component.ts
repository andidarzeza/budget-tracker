import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EntityType } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit, OnDestroy {
  
  private _subject = new Subject();
  savingEntity = false;
  public entity: EntityType = EntityType.CATEGORY;
  
  constructor(
    public sharedService: SharedService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService
  ) {}
  
  categoryGroup: FormGroup = this.formBuilder.group({
    category:     ['', Validators.required],
    description:  ['', Validators.required],
    icon:         ['', Validators.required]
  });

  ngOnInit(): void {
    if(this.editMode) {
      this.categoryGroup.patchValue(this.data.spendingCategory);
    }
  }

  add(): void {
    if(this.categoryGroup.valid && !this.savingEntity){
      if(this.editMode) {
        this.data.spendingCategory.category = this.category.value;
        this.data.spendingCategory.description = this.description.value;
        this.data.spendingCategory.icon = this.icon.value;
        const payload = this.data.spendingCategory;
        payload['categoryType'] = this.data.categoriesType;
        this.savingEntity = true;
        this.categoriesService
          .update(payload)
          .pipe(takeUntil(this._subject))  
          .subscribe(() => this.onSaveSuccess("Category Updated with Success"));
      } else if(!this.savingEntity){
        const payload = this.categoryGroup.value;
        payload['categoryType'] = this.data.categoriesType;
        this.savingEntity = true;
        this.categoriesService
          .save(payload)
          .pipe(takeUntil(this._subject))
          .subscribe(() => this.onSaveSuccess("A new Category has been inserted"));
      }
    }
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);  
    this.savingEntity = false;
    this.toaster.success(message, "Success", TOASTER_CONFIGURATION);
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  onIconSelect(icon: string): void {
    this.icon.setValue(icon);
  }
  
  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

  get editMode() {
    return this.data?.spendingCategory !== undefined;
  }

  get category(){
    return this.categoryGroup.controls['category'];
  }

  get description(){
    return this.categoryGroup.controls['description'];
  }

  get icon(){
    return this.categoryGroup.controls['icon'];
  }
}
