import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface EditBalanceData {
  accountId: string;
  balance: Record<string, number> | null | undefined;
}

@Component({
  selector: 'app-edit-balance',
  templateUrl: './edit-balance.component.html',
  styleUrls: ['./edit-balance.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    CreateFormComponent,
    LabeledFormInputComponent,
    FlagPipe,
  ],
})
export class EditBalanceComponent {
  readonly data = inject<EditBalanceData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EditBalanceComponent>);
  private readonly accountService = inject(AccountService);
  private readonly toaster = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencies = CURRENCIES;
  readonly saving = signal(false);
  /** Title shown in the shared `<create-form>` header — yields "Edit Balance". */
  readonly entity: EntityType = EntityType.BALANCE;

  /** One control per supported currency, keyed by ISO code. Empty string = remove that currency. */
  readonly formGroup: FormGroup = this.buildForm();

  save(): void {
    if (this.saving()) return;
    const cleaned: Record<string, number> = {};
    for (const code of this.currencies) {
      const raw = this.formGroup.get(code)?.value;
      if (raw === '' || raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n === 0) continue;
      cleaned[code] = n;
    }
    this.saving.set(true);
    this.accountService
      .setBalance(this.data.accountId, cleaned)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (account) => {
          this.saving.set(false);
          this.toaster.success('Balance updated', 'Success', TOASTER_CONFIGURATION);
          this.dialogRef.close(account);
        },
        error: () => {
          this.saving.set(false);
          this.toaster.error('Could not update balance.', 'Server Error', TOASTER_CONFIGURATION);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  /** Empties the field; on save the currency is dropped from the balance map. */
  clearCurrency(code: string): void {
    this.formGroup.get(code)?.setValue('');
  }

  private buildForm(): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const code of CURRENCIES) {
      const current = this.data?.balance?.[code];
      controls[code] = this.formBuilder.control(
        current === null || current === undefined ? '' : current,
      );
    }
    return this.formBuilder.group(controls);
  }
}
