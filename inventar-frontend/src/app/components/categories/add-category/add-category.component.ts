import { AfterViewInit, Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { asyncScheduler, Observable } from 'rxjs';
import { filter, map, observeOn, takeUntil } from 'rxjs/operators';
import { EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({ standalone: false,
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent extends Unsubscribe implements AfterViewInit {
  loadingData = false;
  loadingMessage = 'Please wait…';
  savingEntity = false;
  public entity: EntityType = EntityType.CATEGORY;
  showIconSelect = false;
  readonly isEditMode: boolean;

  constructor(
    public sharedService: SharedService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private formBuilder: UntypedFormBuilder,
    private categoriesService: CategoriesService,
    public accountService: AccountService
  ) {
    super();
    this.isEditMode = this.data?.id !== undefined;
  }

  categoryTypes = ["INCOME", "EXPENSE"];
  
  categoryGroup: UntypedFormGroup = this.formBuilder.group({
    category:     ['', Validators.required],
    description:  ['', Validators.required],
    icon:         ['', Validators.required],
    categoryType: ['', Validators.required]
  });

  ngAfterViewInit(): void {
    if (!this.isEditMode) {
      return;
    }
    setTimeout(() => {
      this.loadingMessage = 'Loading…';
      this.loadingData = true;
      this.getCategory().subscribe();
    }, 0);
  }

  private getCategory(): Observable<any> {
    return this.categoriesService
      .findOne(this.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        observeOn(asyncScheduler),
        filter(() => this.isEditMode),
        map(category => this.categoryGroup.patchValue(category)),
        map(() => (this.loadingData = false))
      );
  }

  add(): void {    
    if(this.categoryGroup.valid && !this.savingEntity){
      if(this.isEditMode) {
        this.loadingMessage = 'Saving…';
        this.loadingData = true;
        this.data.category = this.category.value;
        this.data.description = this.description.value;
        this.data.icon = this.icon.value;
        this.data.categoryType = this.categoryType.value;
        const payload = this.data;
        payload.account = this.accountService.getAccount();
        this.savingEntity = true;
        this.categoriesService
          .update(payload.id, payload)
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
          .subscribe(() => this.onSaveSuccess("Category Updated with Success"));
      } else if(!this.savingEntity){
        this.loadingMessage = 'Saving…';
        this.loadingData = true;
        const payload = this.categoryGroup.value;
        payload.account = this.accountService.getAccount();
        this.savingEntity = true;
        this.categoriesService
          .save(payload)
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
          .subscribe(() => this.onSaveSuccess("A new Category has been inserted"));
      }
    } else if(this.categoryGroup.invalid) {
      this.toaster.error("Please, fill in all required fields.", "Error", TOASTER_CONFIGURATION);
    }
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);  
    this.savingEntity = false;
    this.loadingData = false;
    this.toaster.success(message, "Success", TOASTER_CONFIGURATION);
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  get category(){
    return this.categoryGroup.controls['category'];
  }

  get description(){
    return this.categoryGroup.controls['description'];
  }

  get id() {
    return this.data?.id;
  }

  get icon(){
    return this.categoryGroup.controls['icon'];
  }

  get categoryType() {
    return this.categoryGroup.controls['categoryType'];
  }
}
