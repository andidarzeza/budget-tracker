import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  Inject,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { asyncScheduler, Observable } from 'rxjs';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { filter, mergeMap, observeOn, takeUntil, tap } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Expense } from 'src/app/models/models';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { inOutAnimation } from 'src/app/animations';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';

interface AddExpenseDialogData {
  id?: string;
  moneySpent?: number;
  currency?: string;
  description?: string;
}

@Component({
  standalone: false,
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
})
export class AddExpenseComponent extends Unsubscribe implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointService = inject(BreakpointService);
  private readonly flagPipe = inject(FlagPipe);

  /** Currency option label: "🇺🇸 USD". */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;
  /** Category option label: just the name. */
  readonly displayCategory = (c: Category) => c?.category ?? '';
  /** Categories store the id on the form control. */
  readonly categoryIdValue = (c: Category) => c?.id ?? null;

  /** Fullscreen keypad / currency menu wizard only on narrow viewports (≤767px). */
  readonly isWizardMobile = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  readonly savingEntity = signal(false);
  public entity: EntityType = EntityType.EXPENSE;
  readonly categories = signal<Category[]>([]);
  public baseCurrency = localStorage.getItem('baseCurrency');
  readonly loadingData = signal(false);
  readonly loadingMessage = signal('Loading…');
  readonly isEditMode: boolean;
  readonly isQrPrefillMode: boolean;

  readonly wizardStep = signal(0);
  readonly wizardStepLabels: readonly string[];

  /** Wizard step 1: raw keypad string (digits + optional `.`), synced to `moneySpent`. */
  readonly amountEntry = signal('');
  readonly amountDisplay = computed(() => {
    const s = this.amountEntry();
    if (s === '' || s === '.') {
      return '0';
    }
    return s;
  });

  constructor(
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public expense: AddExpenseDialogData | null,
    public dialogRef: MatDialogRef<AddExpenseComponent>,
    private formBuilder: UntypedFormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoriesService,
    public accountService: AccountService
  ) {
    super();
    this.isEditMode = !!this.expense?.id;
    this.isQrPrefillMode = !this.isEditMode && this.expense?.moneySpent != null;
    this.wizardStepLabels = this.isQrPrefillMode
      ? ['Category', 'Description']
      : ['Category', 'Amount', 'Description'];
  }

  formGroup: UntypedFormGroup = this.formBuilder.group({
    description: [''],
    categoryID: ['', Validators.required],
    moneySpent: ['', Validators.required],
    currency: ['', Validators.required],
  });

  currencies = CURRENCIES;

  ngOnInit(): void {
    this.formGroup.get('currency')?.setValue(this.baseCurrency);
    if (this.isQrPrefillMode) {
      const scannedAmount = Number(this.expense?.moneySpent);
      if (Number.isFinite(scannedAmount)) {
        this.formGroup.get('moneySpent')?.setValue(scannedAmount);
        this.amountEntry.set(
          scannedAmount.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })
        );
      }
      this.formGroup.get('currency')?.setValue(this.expense?.currency || 'ALL');
      this.formGroup.get('description')?.setValue(this.expense?.description || '');
    }
    if (!this.isEditMode) {
      this.wizardStep.set(0);
    }
    this.getCategories();
  }

  wizardNext(): void {
    if (this.wizardStep() === 0 && !this.validateWizardCategoryStep()) {
      return;
    }
    if (!this.isQrPrefillMode && this.wizardStep() === 1 && !this.validateWizardAmountStep()) {
      return;
    }
    if (this.wizardStep() < this.lastWizardStep()) {
      if (!this.isQrPrefillMode && this.wizardStep() === 0 && this.isWizardMobile()) {
        this.primeWizardAmountEntry();
      }
      this.wizardStep.update((s) => s + 1);
    }
  }

  onAmountEntryChange(raw: string): void {
    this.amountEntry.set(raw);
    this.syncMoneySpentFromEntry(raw);
  }

  private primeWizardAmountEntry(): void {
    const v = this.formGroup.get('moneySpent')?.value;
    if (v === null || v === undefined || v === '') {
      this.amountEntry.set('');
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) {
      this.amountEntry.set('');
      return;
    }
    this.amountEntry.set(
      n.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })
    );
    this.syncMoneySpentFromEntry(this.amountEntry());
  }

  private syncMoneySpentFromEntry(raw: string): void {
    const ctrl = this.formGroup.get('moneySpent');
    if (!ctrl) {
      return;
    }
    if (raw === '' || raw === '.') {
      ctrl.setValue('', { emitEvent: true });
      return;
    }
    const n = parseFloat(raw.replace(',', '.'));
    if (!Number.isFinite(n)) {
      ctrl.setValue('', { emitEvent: true });
      return;
    }
    ctrl.setValue(n, { emitEvent: true });
  }

  wizardBack(): void {
    if (this.wizardStep() > 0) {
      this.wizardStep.update((s) => s - 1);
    }
  }

  lastWizardStep(): number {
    return this.isQrPrefillMode ? 1 : 2;
  }

  selectWizardCategory(categoryId: string | number): void {
    this.formGroup.get('categoryID')?.setValue(categoryId);
    this.formGroup.get('categoryID')?.markAsTouched();
  }

  selectWizardCurrency(code: string): void {
    this.formGroup.get('currency')?.setValue(code);
    this.formGroup.get('currency')?.markAsTouched();
  }

  private validateWizardCategoryStep(): boolean {
    const c = this.formGroup.get('categoryID');
    c?.markAsTouched();
    return !!c?.valid;
  }

  private validateWizardAmountStep(): boolean {
    if (this.isWizardMobile()) {
      this.syncMoneySpentFromEntry(this.amountEntry());
    }
    const m = this.formGroup.get('moneySpent');
    const cur = this.formGroup.get('currency');
    m?.markAsTouched();
    cur?.markAsTouched();
    return !!(m?.valid && cur?.valid);
  }

  private getExpense(): Observable<any> {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    return this.expenseService.findOne(this.id).pipe(
      takeUntil(this.unsubscribe$),
      tap((expense) => {
        this.formGroup.patchValue(expense);
        this.cdr.markForCheck();
      }),
      observeOn(asyncScheduler),
      tap(() => {
        this.loadingData.set(false);
      })
    );
  }

  private getCategories(): void {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    // Backend returns categories already sorted by usage count (most used first).
    this.categoryService
      .findByUsage(this.accountService.getAccount(), CategoryType.EXPENSE)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((rows: Category[]) => {
          const list = Array.isArray(rows) ? rows : [];
          this.categories.set(
            list.filter(
              (c: Category) => !c?.categoryType || c.categoryType === CategoryType.EXPENSE
            )
          );
        }),
        observeOn(asyncScheduler),
        tap(() => {
          this.loadingData.set(false);
        }),
        filter(() => this.isEditMode),
        mergeMap(() => this.getExpense())
      )
      .subscribe();
  }

  public closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }

  add(): void {
    if (this.formGroup.valid && !this.savingEntity()) {
      if (this.isEditMode) {
        this.loadingMessage.set('Saving…');
        this.loadingData.set(true);
        this.savingEntity.set(true);
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .update(this.expense.id, payload)
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService
              .findOne(this.accountService.getAccount())
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe();
            this.loadingData.set(false);
            this.savingEntity.set(false);
            this.closeDialog(true);
            this.toaster.success('Expense updated successfully', 'Success', TOASTER_CONFIGURATION);
          });
      } else if (!this.savingEntity()) {
        this.loadingMessage.set('Saving…');
        this.loadingData.set(true);
        this.savingEntity.set(true);
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.expenseService
          .save(payload)
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService
              .findOne(this.accountService.getAccount())
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe();
            this.savingEntity.set(false);
            this.loadingData.set(false);
            this.closeDialog(true);
            this.toaster.success('A new Expense has been inserted', 'Success', TOASTER_CONFIGURATION);
          });
      }
    } else if (this.formGroup.invalid) {
      this.toaster.error('Please, fill in all required fields.', 'Error', TOASTER_CONFIGURATION);
    }
  }

  get id() {
    return this.expense?.id;
  }
}
