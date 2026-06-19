import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { EntityType, Wallet, WalletType } from 'src/app/models/models';
import { WalletService } from 'src/app/services/pages/wallet.service';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface ManageWalletsData {
  accountId: string;
}

/**
 * Manage the workspace's money sources (bank accounts + cash holdings):
 * list them, add new ones, edit name/type/currency/balance, or delete.
 * Replaces the old per-currency "Edit balance" dialog now that balances
 * live on individual sources.
 */
@Component({
  selector: 'app-manage-wallets',
  templateUrl: './manage-wallets.component.html',
  styleUrls: ['./manage-wallets.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    CreateFormComponent,
    IconButtonComponent,
    LabeledFormInputComponent,
    SelectInputComponent,
    PillButtonComponent,
    FlagPipe,
    ...TOOLTIP_IMPORTS,
  ],
})
export class ManageWalletsComponent {
  readonly data = inject<ManageWalletsData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ManageWalletsComponent>);
  private readonly walletService = inject(WalletService);
  private readonly toaster = inject(ToastrService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly destroyRef = inject(DestroyRef);

  /** Header title — cast through `any` since this dialog isn't a single domain entity. */
  readonly entity = 'sources' as unknown as EntityType;

  readonly currencies = CURRENCIES;
  readonly types: WalletType[] = ['BANK', 'CASH'];
  readonly displayType = (t: WalletType) => (t === 'BANK' ? 'Bank account' : 'Cash');
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;

  readonly wallets = signal<Wallet[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  /** Null = list view; otherwise the wallet being edited ('' id = new). */
  readonly editing = signal<Wallet | null>(null);
  /** Tracks whether anything changed, so the dashboard knows to refresh. */
  private changed = false;

  readonly formGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    type: ['BANK' as WalletType, Validators.required],
    currency: [CURRENCIES[0], Validators.required],
    balance: [0, Validators.required],
  });

  constructor() {
    this.loadWallets();
  }

  bankWallets(): Wallet[] {
    return this.wallets().filter((w) => w.type === 'BANK');
  }

  cashWallets(): Wallet[] {
    return this.wallets().filter((w) => w.type === 'CASH');
  }

  startAdd(): void {
    this.formGroup.reset({ name: '', type: 'BANK', currency: CURRENCIES[0], balance: 0 });
    this.editing.set({ name: '', type: 'BANK', currency: CURRENCIES[0], balance: 0 });
  }

  startEdit(wallet: Wallet): void {
    this.formGroup.reset({
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      balance: wallet.balance ?? 0,
    });
    this.editing.set(wallet);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  saveWallet(): void {
    if (this.formGroup.invalid || this.saving()) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const current = this.editing();
    if (!current) return;
    this.saving.set(true);
    const payload: Wallet = {
      ...this.formGroup.value,
      balance: Number(this.formGroup.value.balance) || 0,
      account: this.data.accountId,
    };
    const request$ = current.id
      ? this.walletService.update(current.id, payload)
      : this.walletService.save(payload);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.changed = true;
        this.editing.set(null);
        this.toaster.success('Source saved', 'Success', TOASTER_CONFIGURATION);
        this.loadWallets();
      },
      error: () => {
        this.saving.set(false);
        this.toaster.error('Could not save the source.', 'Server Error', TOASTER_CONFIGURATION);
      },
    });
  }

  deleteWallet(wallet: Wallet): void {
    if (!wallet.id || this.saving()) return;
    this.saving.set(true);
    this.walletService
      .delete(wallet.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.changed = true;
          this.toaster.success('Source removed', 'Success', TOASTER_CONFIGURATION);
          this.loadWallets();
        },
        error: () => {
          this.saving.set(false);
          this.toaster.error('Could not remove the source.', 'Server Error', TOASTER_CONFIGURATION);
        },
      });
  }

  close(): void {
    this.dialogRef.close(this.changed);
  }

  private loadWallets(): void {
    this.loading.set(true);
    this.walletService
      .list(this.data.accountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallets) => {
          this.wallets.set(wallets ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
