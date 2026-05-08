import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EntityType, Project } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectIconComponent } from 'src/app/shared/select-icon/select-icon.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CreateFormComponent,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent,
    SelectIconComponent,
  ],
})
export class AddProjectComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddProjectComponent>);
  private readonly projectService = inject(ProjectService);
  private readonly accountService = inject(AccountService);
  private readonly toaster = inject(ToastrService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadingData = signal(false);
  readonly loadingMessage = signal('Loading…');
  readonly saving = signal(false);

  /** create-form expects an entity type; we reuse expense styling — projects pass a custom icon. */
  readonly entity: EntityType = EntityType.EXPENSE;
  readonly isEditMode: boolean;

  readonly currencies = CURRENCIES;
  readonly defaultCurrency = localStorage.getItem('baseCurrency') || CURRENCIES[0];

  /** Currency option label: "🇺🇸 USD". Shared with `cb-select-input.displayWith`. */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;

  formGroup: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Project | null) {
    this.isEditMode = !!this.data?.id;
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      targetAmount: ['', [Validators.required, Validators.min(0.01)]],
      targetCurrency: [this.defaultCurrency, Validators.required],
      icon: ['flag'],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data) {
      this.formGroup.patchValue({
        name: this.data.name,
        description: this.data.description ?? '',
        targetAmount: this.data.targetAmount,
        targetCurrency: this.data.targetCurrency,
        icon: this.data.icon || 'flag',
      });
    }
  }

  add(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.toaster.error('Please, fill in all required fields.', 'Error', TOASTER_CONFIGURATION);
      return;
    }
    if (this.saving()) return;
    this.saving.set(true);
    this.loadingMessage.set('Saving…');
    this.loadingData.set(true);

    const payload: Project = {
      ...this.formGroup.value,
      account: this.accountService.getAccount(),
    };

    const op$ = this.isEditMode
      ? this.projectService.update(this.data!.id!, payload)
      : this.projectService.save(payload);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadingData.set(false);
        this.toaster.success(
          this.isEditMode ? 'Project updated' : 'Project created',
          'Success',
          TOASTER_CONFIGURATION,
        );
        this.closeDialog(true);
      },
      error: () => {
        this.saving.set(false);
        this.loadingData.set(false);
        this.toaster.error('Could not save project.', 'Server Error', TOASTER_CONFIGURATION);
      },
    });
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
}
