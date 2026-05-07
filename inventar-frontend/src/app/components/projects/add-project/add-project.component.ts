import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { EntityType, Project } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe]
})
export class AddProjectComponent extends Unsubscribe implements OnInit {

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

  formGroup: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Project | null,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    private projectService: ProjectService,
    private accountService: AccountService,
    private toaster: ToastrService,
    private flagPipe: FlagPipe
  ) {
    super();
    this.isEditMode = !!this.data?.id;
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      targetAmount: ['', [Validators.required, Validators.min(0.01)]],
      targetCurrency: [this.defaultCurrency, Validators.required],
      icon: ['flag']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data) {
      this.formGroup.patchValue({
        name: this.data.name,
        description: this.data.description ?? '',
        targetAmount: this.data.targetAmount,
        targetCurrency: this.data.targetCurrency,
        icon: this.data.icon || 'flag'
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
      account: this.accountService.getAccount()
    };

    const op$ = this.isEditMode
      ? this.projectService.update(this.data!.id!, payload)
      : this.projectService.save(payload);

    op$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadingData.set(false);
        this.toaster.success(
          this.isEditMode ? 'Project updated' : 'Project created',
          'Success',
          TOASTER_CONFIGURATION
        );
        this.closeDialog(true);
      },
      error: () => {
        this.saving.set(false);
        this.loadingData.set(false);
        this.toaster.error('Could not save project.', 'Server Error', TOASTER_CONFIGURATION);
      }
    });
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }
}
