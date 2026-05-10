import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  Optional,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { asyncScheduler, Observable } from 'rxjs';
import { filter, mergeMap, observeOn, tap } from 'rxjs/operators';
import { Category, CategoryType, EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AmountKeypadComponent } from 'src/app/shared/amount-keypad/amount-keypad.component';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledDateInputComponent } from 'src/app/shared/labeled-date-input/labeled-date-input.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { toBareLocalIso } from 'src/app/utils/local-iso';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

interface AddExpenseDialogData {
  id?: string;
  moneySpent?: number;
  currency?: string;
  description?: string;
}

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    CreateFormComponent,
    LabeledDateInputComponent,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent,
    AmountKeypadComponent,
    FlagPipe,
  ],
})
export class AddExpenseComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointService = inject(BreakpointService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly navBarService = inject(NavBarService);
  private readonly sideBarService = inject(SideBarService);
  private readonly toaster = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoriesService);
  readonly accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);

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
  entity: EntityType = EntityType.EXPENSE;
  readonly categories = signal<Category[]>([]);
  baseCurrency = localStorage.getItem('baseCurrency');
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

  /**
   * Routed-page mode (mobile create). When the component is opened via
   * `Router.navigate(['/expenses/add'])` instead of `MatDialog.open(...)`,
   * MAT_DIALOG_DATA and MatDialogRef are absent — render a full-page shell
   * (sticky header + scrolling body + sticky footer) instead of the dialog
   * chrome. Native browser scroll keeps iOS scrolling smooth.
   */
  readonly isPageMode: boolean;

  formGroup: FormGroup = this.formBuilder.group({
    description: [''],
    categoryID: ['', Validators.required],
    moneySpent: ['', Validators.required],
    currency: ['', Validators.required],
    // Transaction date — bound to the Material datepicker; defaults to today.
    createdTime: [new Date() as Date | null, Validators.required],
  });

  currencies = CURRENCIES;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public expense: AddExpenseDialogData | null = null,
    @Optional() public dialogRef: MatDialogRef<AddExpenseComponent> | null = null,
  ) {
    this.isPageMode = !this.dialogRef;
    this.isEditMode = !!this.expense?.id;
    this.isQrPrefillMode = !this.isEditMode && this.expense?.moneySpent != null;
    this.wizardStepLabels = this.isQrPrefillMode
      ? ['Category', 'Description']
      : ['Category', 'Amount', 'Description'];
  }

  ngOnInit(): void {
    if (this.isPageMode) {
      // Hide the app shell so the sticky header below is the only top bar.
      this.navBarService.displayNavBar = false;
      this.sideBarService.displaySidebar = false;
    }
    this.formGroup.get('currency')?.setValue(this.baseCurrency);
    if (this.isQrPrefillMode) {
      const scannedAmount = Number(this.expense?.moneySpent);
      if (Number.isFinite(scannedAmount)) {
        this.formGroup.get('moneySpent')?.setValue(scannedAmount);
        this.amountEntry.set(
          scannedAmount.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false }),
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

  closeDialog(update: boolean): void {
    if (this.dialogRef) {
      this.dialogRef.close(update);
      return;
    }
    // Routed-page mode — navigate back to the list. The list component is
    // re-created on entry, so successful saves naturally show in the
    // refreshed query.
    this.router.navigate(['/expenses']);
  }

  add(): void {
    if (this.formGroup.valid && !this.savingEntity()) {
      if (this.isEditMode) {
        this.loadingMessage.set('Saving…');
        this.loadingData.set(true);
        this.savingEntity.set(true);
        const payload = this.buildPayload();
        this.expenseService
          .update(this.expense!.id!, payload)
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService
              .findOne(this.accountService.getAccount())
              .pipe(takeUntilDestroyed(this.destroyRef))
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
        const payload = this.buildPayload();
        this.expenseService
          .save(payload)
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService
              .findOne(this.accountService.getAccount())
              .pipe(takeUntilDestroyed(this.destroyRef))
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

  /**
   * Backend's `Expense.createdTime` is `LocalDateTime`, which has no zone.
   * Sending `JSON.stringify(date)` (UTC `Z`) makes Jackson drop the offset
   * and shift the wall-clock; sending `+HH:MM` makes its deserializer
   * throw. The right format is a bare local wall-clock string.
   */
  private buildPayload(): any {
    const value = { ...this.formGroup.value };
    const picked = value.createdTime instanceof Date ? value.createdTime : new Date();
    value.createdTime = toBareLocalIso(picked);
    value.account = this.accountService.getAccount();
    return value;
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
      n.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false }),
    );
    this.syncMoneySpentFromEntry(this.amountEntry());
  }

  private syncMoneySpentFromEntry(raw: string): void {
    const ctrl = this.formGroup.get('moneySpent');
    if (!ctrl) return;
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
    return this.expenseService.findOne(this.id!).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((expense) => {
        this.formGroup.patchValue({
          ...expense,
          createdTime: expense?.createdTime ? new Date(expense.createdTime) : new Date(),
        });
        this.cdr.markForCheck();
      }),
      observeOn(asyncScheduler),
      tap(() => {
        this.loadingData.set(false);
      }),
    );
  }

  private getCategories(): void {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    // Backend returns categories already sorted by usage count (most used first).
    this.categoryService
      .findByUsage(this.accountService.getAccount(), CategoryType.EXPENSE)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((rows: Category[]) => {
          const list = Array.isArray(rows) ? rows : [];
          this.categories.set(
            list.filter(
              (c: Category) => !c?.categoryType || c.categoryType === CategoryType.EXPENSE,
            ),
          );
        }),
        observeOn(asyncScheduler),
        tap(() => {
          this.loadingData.set(false);
        }),
        filter(() => this.isEditMode),
        mergeMap(() => this.getExpense()),
      )
      .subscribe();
  }
}
