import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { EntityType, Transfer, Wallet } from 'src/app/models/models';
import { TransferService } from 'src/app/services/pages/transfer.service';
import { WalletService } from 'src/app/services/pages/wallet.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

interface TransferMoneyData {
  accountId: string;
}

/**
 * Move money from one source to another — e.g. cash withdrawn from a bank account at an ATM.
 * Same-currency transfers move a single amount; cross-currency transfers ask for the converted
 * amount that lands in the destination. This is not income/expense — it only shifts balances.
 */
@Component({
  selector: 'app-transfer-money',
  templateUrl: './transfer-money.component.html',
  styleUrls: ['./transfer-money.component.css'],
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
    PillButtonComponent,
  ],
})
export class TransferMoneyComponent {
  readonly data = inject<TransferMoneyData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TransferMoneyComponent>);
  private readonly transferService = inject(TransferService);
  private readonly walletService = inject(WalletService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly toaster = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /** Header title — cast through `any` since this dialog isn't a single domain entity. */
  readonly entity = 'transfer' as unknown as EntityType;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly sources = signal<Wallet[]>([]);

  readonly displaySource = (w: Wallet) =>
    `${w?.type === 'BANK' ? '🏦' : '💵'} ${w?.name} · ${this.flagPipe.transform(w?.currency)} ${w?.currency}`;
  readonly sourceIdValue = (w: Wallet) => w?.id ?? null;

  /** Re-evaluated whenever a control changes (the selects mark the form dirty). */
  private readonly formTick = signal(0);

  readonly fromWallet = computed<Wallet | null>(() => {
    this.formTick();
    const id = this.formGroup.get('fromWalletId')?.value;
    return this.sources().find((w) => w.id === id) ?? null;
  });
  readonly toWallet = computed<Wallet | null>(() => {
    this.formTick();
    const id = this.formGroup.get('toWalletId')?.value;
    return this.sources().find((w) => w.id === id) ?? null;
  });
  /** True once both sides are picked and they use different currencies. */
  readonly crossCurrency = computed<boolean>(() => {
    const from = this.fromWallet();
    const to = this.toWallet();
    return !!from && !!to && (from.currency || '') !== (to.currency || '');
  });

  readonly formGroup: FormGroup = this.formBuilder.group({
    fromWalletId: ['', Validators.required],
    toWalletId: ['', Validators.required],
    amountFrom: ['', [Validators.required, Validators.min(0.01)]],
    amountTo: [''],
    description: [''],
  });

  constructor() {
    this.loadSources();
    // Recompute the from/to wallet + cross-currency hint as selections change.
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formTick.update((n) => n + 1));
  }

  save(): void {
    if (this.saving()) return;
    const sameWallet =
      this.formGroup.get('fromWalletId')?.value === this.formGroup.get('toWalletId')?.value;
    if (sameWallet) {
      this.toaster.error('Pick two different sources.', 'Error', TOASTER_CONFIGURATION);
      return;
    }
    if (this.crossCurrency()) {
      const to = Number(this.formGroup.get('amountTo')?.value);
      if (!Number.isFinite(to) || to <= 0) {
        this.formGroup.get('amountTo')?.markAsTouched();
        this.toaster.error('Enter the amount received.', 'Error', TOASTER_CONFIGURATION);
        return;
      }
    }
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.toaster.error('Please, fill in all required fields.', 'Error', TOASTER_CONFIGURATION);
      return;
    }

    this.saving.set(true);
    const value = this.formGroup.value;
    const payload: Transfer = {
      fromWalletId: value.fromWalletId,
      toWalletId: value.toWalletId,
      amountFrom: Number(value.amountFrom),
      // Server ignores amountTo for same-currency transfers, but only send it when relevant.
      amountTo: this.crossCurrency() ? Number(value.amountTo) : undefined,
      description: value.description,
      account: this.data.accountId,
    };
    this.transferService
      .save(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toaster.success('Money moved', 'Success', TOASTER_CONFIGURATION);
          this.dialogRef.close(true);
        },
        error: () => {
          this.saving.set(false);
          this.toaster.error('Could not move the money.', 'Server Error', TOASTER_CONFIGURATION);
        },
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private loadSources(): void {
    this.loading.set(true);
    this.walletService
      .list(this.data.accountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallets) => {
          this.sources.set((wallets ?? []).filter((w) => !w.archived));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
