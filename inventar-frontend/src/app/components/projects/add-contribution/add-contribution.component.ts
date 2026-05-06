import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Contribution, EntityType } from 'src/app/models/models';
import { ProjectService } from 'src/app/services/pages/project.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface AddContributionData {
  projectId: string;
  defaultCurrency?: string;
}

@Component({
  standalone: false,
  selector: 'app-add-contribution',
  templateUrl: './add-contribution.component.html',
  styleUrls: ['./add-contribution.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddContributionComponent extends Unsubscribe implements OnInit {

  readonly loadingData = signal(false);
  readonly loadingMessage = signal('Loading…');
  readonly saving = signal(false);

  /** create-form needs an entity; income visually fits a "money in" form. */
  readonly entity: EntityType = EntityType.INCOME;
  readonly isEditMode = false;

  readonly currencies = CURRENCIES;
  formGroup: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: AddContributionData,
    private dialogRef: MatDialogRef<AddContributionComponent>,
    private projectService: ProjectService,
    private toaster: ToastrService
  ) {
    super();
    const defaultCurrency = this.data?.defaultCurrency
      || localStorage.getItem('baseCurrency')
      || CURRENCIES[0];
    this.formGroup = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: [defaultCurrency, Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {}

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

    this.projectService.addContribution(this.data.projectId, payload)
      .pipe(takeUntil(this.unsubscribe$))
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
        }
      });
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
}
