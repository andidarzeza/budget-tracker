import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, Inject, inject, OnInit, Optional } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { asyncScheduler, Observable } from 'rxjs';
import { filter, map, observeOn } from 'rxjs/operators';
import { EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectIconComponent } from 'src/app/shared/select-icon/select-icon.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    CreateFormComponent,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent,
    SelectIconComponent,
  ],
})
export class AddCategoryComponent implements OnInit, AfterViewInit {
  readonly sharedService = inject(SharedService);
  private readonly toaster = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  readonly accountService = inject(AccountService);
  private readonly navBarService = inject(NavBarService);
  private readonly sideBarService = inject(SideBarService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loadingData = false;
  loadingMessage = 'Please wait…';
  savingEntity = false;
  entity: EntityType = EntityType.CATEGORY;
  readonly isEditMode: boolean;
  readonly isPageMode: boolean;

  categoryTypes = ['INCOME', 'EXPENSE'];

  categoryGroup: FormGroup = this.formBuilder.group({
    category: ['', Validators.required],
    description: ['', Validators.required],
    icon: ['', Validators.required],
    categoryType: ['', Validators.required],
  });

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() public dialogRef: MatDialogRef<AddCategoryComponent> | null = null,
  ) {
    this.isPageMode = !this.dialogRef;
    this.isEditMode = this.data?.id !== undefined;
  }

  ngOnInit(): void {
    if (this.isPageMode) {
      this.navBarService.displayNavBar = false;
      this.sideBarService.displaySidebar = false;
    }
  }

  ngAfterViewInit(): void {
    if (!this.isEditMode) return;
    setTimeout(() => {
      this.loadingMessage = 'Loading…';
      this.loadingData = true;
      this.getCategory().subscribe();
    }, 0);
  }

  add(): void {
    if (this.categoryGroup.valid && !this.savingEntity) {
      if (this.isEditMode) {
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
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => this.onSaveSuccess('Category Updated with Success'));
      } else if (!this.savingEntity) {
        this.loadingMessage = 'Saving…';
        this.loadingData = true;
        const payload = this.categoryGroup.value;
        payload.account = this.accountService.getAccount();
        this.savingEntity = true;
        this.categoriesService
          .save(payload)
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => this.onSaveSuccess('A new Category has been inserted'));
      }
    } else if (this.categoryGroup.invalid) {
      this.toaster.error('Please, fill in all required fields.', 'Error', TOASTER_CONFIGURATION);
    }
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);
    this.savingEntity = false;
    this.loadingData = false;
    this.toaster.success(message, 'Success', TOASTER_CONFIGURATION);
  }

  closeDialog(update: boolean): void {
    if (this.dialogRef) {
      this.dialogRef.close(update);
      return;
    }
    this.router.navigate(['/categories']);
  }

  get category() {
    return this.categoryGroup.controls['category'];
  }

  get description() {
    return this.categoryGroup.controls['description'];
  }

  get id() {
    return this.data?.id;
  }

  get icon() {
    return this.categoryGroup.controls['icon'];
  }

  get categoryType() {
    return this.categoryGroup.controls['categoryType'];
  }

  private getCategory(): Observable<any> {
    return this.categoriesService.findOne(this.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      observeOn(asyncScheduler),
      filter(() => this.isEditMode),
      map((category) => this.categoryGroup.patchValue(category)),
      map(() => (this.loadingData = false)),
    );
  }
}
