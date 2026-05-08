import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Contribution, EntityType } from 'src/app/models/models';
import { ProjectService } from 'src/app/services/pages/project.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface AddContributionData {
  projectId: string;
  defaultCurrency?: string;
}

@Component({
  selector: 'app-add-contribution',
  templateUrl: './add-contribution.component.html',
  styleUrls: ['./add-contribution.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    CreateFormComponent,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent,
  ],
})
export class AddContributionComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddContributionComponent>);
  private readonly projectService = inject(ProjectService);
  private readonly toaster = inject(ToastrService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadingData = signal(false);
  readonly loadingMessage = signal('Loading…');
  readonly saving = signal(false);

  /** create-form needs an entity; income visually fits a "money in" form. */
  readonly entity: EntityType = EntityType.INCOME;
  readonly isEditMode = false;

  readonly currencies = CURRENCIES;
  /** Currency option label: "🇺🇸 USD". */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;
  formGroup: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AddContributionData) {
    const defaultCurrency =
      this.data?.defaultCurrency || localStorage.getItem('baseCurrency') || CURRENCIES[0];
    this.formGroup = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: [defaultCurrency, Validators.required],
      description: [''],
    });
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

    const payload: Contribution = { ...this.formGroup.value };

    this.projectService
      .addContribution(this.data.projectId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.loadingData.set(false);
          this.toaster.success('Contribution added', 'Success', TOASTER_CONFIGURATION);
          this.closeDialog(true);
        },
        error: () => {
          this.saving.set(false);
          this.loadingData.set(false);
          this.toaster.error('Could not save contribution.', 'Server Error', TOASTER_CONFIGURATION);
        },
      });
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
}
