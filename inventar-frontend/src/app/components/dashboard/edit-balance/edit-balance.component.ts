import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface EditBalanceData {
  accountId: string;
  balance: Record<string, number> | null | undefined;
}

@Component({
  standalone: false,
  selector: 'app-edit-balance',
  templateUrl: './edit-balance.component.html',
  styleUrls: ['./edit-balance.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditBalanceComponent extends Unsubscribe implements OnInit {

  readonly currencies = CURRENCIES;
  readonly saving = signal(false);
  /** Title shown in the shared `<create-form>` header — yields "Edit Balance". */
  readonly entity: EntityType = EntityType.BALANCE;

  /** One control per supported currency, keyed by ISO code. Empty string = remove that currency. */
  formGroup: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditBalanceData,
    private formBuilder: UntypedFormBuilder,
    private dialogRef: MatDialogRef<EditBalanceComponent>,
    private accountService: AccountService,
    private toaster: ToastrService
  ) {
    super();
    const controls: Record<string, UntypedFormControl> = {};
    for (const code of CURRENCIES) {
      const current = this.data?.balance?.[code];
      controls[code] = this.formBuilder.control(
        current === null || current === undefined ? '' : current
      );
    }
    this.formGroup = this.formBuilder.group(controls);
  }

  ngOnInit(): void {}

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
    this.accountService.setBalance(this.data.accountId, cleaned)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: account => {
          this.saving.set(false);
          this.toaster.success('Balance updated', 'Success', TOASTER_CONFIGURATION);
          this.dialogRef.close(account);
        },
        error: () => {
          this.saving.set(false);
          this.toaster.error('Could not update balance.', 'Server Error', TOASTER_CONFIGURATION);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  /** Empties the field; on save the currency is dropped from the balance map. */
  clearCurrency(code: string): void {
    this.formGroup.get(code)?.setValue('');
  }
}
