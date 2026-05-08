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
import { Category, CategoryType, EntityType, Income } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AmountKeypadComponent } from 'src/app/shared/amount-keypad/amount-keypad.component';
import { CreateFormComponent } from 'src/app/shared/create-form/create-form.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlagPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    CreateFormComponent,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent,
    AmountKeypadComponent,
    FlagPipe,
  ],
})
export class AddIncomeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointService = inject(BreakpointService);
  private readonly flagPipe = inject(FlagPipe);
  private readonly navBarService = inject(NavBarService);
  private readonly sideBarService = inject(SideBarService);
  readonly sharedService = inject(SharedService);
  private readonly toaster = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeService = inject(IncomeService);
  private readonly categoryService = inject(CategoriesService);
  private readonly accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);

  /** Currency option label: "🇺🇸 USD". */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;
  /** Category option label: just the name. */
  readonly displayCategory = (c: Category) => c?.category ?? '';
  /** Categories store the id on the form control. */
  readonly categoryIdValue = (c: Category) => c?.id ?? null;

  readonly isWizardMobile = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  readonly savingEntity = signal(false);
  readonly loadingData = signal(false);
  readonly loadingMessage = signal('Loading…');
  readonly isEditMode: boolean;

  readonly wizardStep = signal(0);
  readonly wizardStepLabels: readonly string[] = ['Category', 'Amount', 'Description'];

  readonly amountEntry = signal('');
  readonly amountDisplay = computed(() => {
    const s = this.amountEntry();
    if (s === '' || s === '.') {
      return '0';
    }
    return s;
  });

  formGroup: FormGroup;

  /**
   * Routed-page mode (mobile create). When the component is opened via
   * `Router.navigate(['/incomes/add'])` instead of `MatDialog.open(...)`,
   * MAT_DIALOG_DATA and MatDialogRef are absent — render a full-page shell
   * (sticky header + scrolling body + sticky footer) instead of the dialog
   * chrome. Native browser scroll keeps iOS scrolling smooth.
   */
  readonly isPageMode: boolean;

  baseCurrency = localStorage.getItem('baseCurrency');

  currencies = CURRENCIES;
  entity: EntityType = EntityType.INCOME;

  readonly categories = signal<Category[]>([]);

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public income: Income | null = null,
    @Optional() private dialogRef: MatDialogRef<AddIncomeComponent> | null = null,
  ) {
    this.isPageMode = !this.dialogRef;
    this.isEditMode = this.income != null;
    this.formGroup = this.formBuilder.group({
      description: [''],
      categoryID: ['', Validators.required],
      incoming: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }

  get name() {
    return this.formGroup.controls['name'];
  }

  get description() {
    return this.formGroup.controls['description'];
  }

  get category() {
    return this.formGroup.controls['categoryID'];
  }

  get incomeValue() {
    return this.formGroup.controls['incoming'];
  }

  get id() {
    return this.income?.id;
  }

  ngOnInit(): void {
    if (this.isPageMode) {
      // Hide the app shell so the sticky header below is the only top bar.
      this.navBarService.displayNavBar = false;
      this.sideBarService.displaySidebar = false;
    }
    this.formGroup.get('currency')?.setValue(this.baseCurrency);
    if (!this.isEditMode) {
      this.wizardStep.set(0);
    }
    this.getCategories();
  }

  wizardNext(): void {
    if (this.wizardStep() === 0 && !this.validateWizardCategoryStep()) {
      return;
    }
    if (this.wizardStep() === 1 && !this.validateWizardAmountStep()) {
      return;
    }
    if (this.wizardStep() < 2) {
      if (this.wizardStep() === 0 && this.isWizardMobile()) {
        this.primeWizardAmountEntry();
      }
      this.wizardStep.update((s) => s + 1);
    }
  }

  onAmountEntryChange(raw: string): void {
    this.amountEntry.set(raw);
    this.syncIncomingFromEntry(raw);
  }

  wizardBack(): void {
    if (this.wizardStep() > 0) {
      this.wizardStep.update((s) => s - 1);
    }
  }

  selectWizardCategory(categoryId: string | number): void {
    this.formGroup.get('categoryID')?.setValue(categoryId);
    this.formGroup.get('categoryID')?.markAsTouched();
  }

  selectWizardCurrency(code: string): void {
    this.formGroup.get('currency')?.setValue(code);
    this.formGroup.get('currency')?.markAsTouched();
  }

  add(): void {
    if (this.formGroup.valid && !this.savingEntity()) {
      if (this.isEditMode) {
        this.loadingMessage.set('Saving…');
        this.loadingData.set(true);
        this.savingEntity.set(true);
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .update(this.income!.id, payload)
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.onSaveSuccess('Income updated with success');
          });
      } else if (!this.savingEntity()) {
        this.loadingMessage.set('Saving…');
        this.loadingData.set(true);
        this.savingEntity.set(true);
        const payload = this.formGroup.value;
        payload.account = this.accountService.getAccount();
        this.incomeService
          .save(payload)
          .pipe(takeUntilDestroyed(this.destroyRef), observeOn(asyncScheduler))
          .subscribe(() => {
            this.accountService.findOne(this.accountService.getAccount()).subscribe();
            this.onSaveSuccess('A new Income has been inserted');
          });
      }
    } else if (this.formGroup.invalid) {
      this.toaster.error('Please, fill in all required fields.', 'Error', TOASTER_CONFIGURATION);
    }
  }

  closeDialog(update: boolean): void {
    if (this.dialogRef) {
      this.dialogRef.close(update);
      return;
    }
    // Routed-page mode — navigate back to the list. The list component is
    // re-created on entry, so successful saves naturally show in the
    // refreshed query.
    this.router.navigate(['/incomes']);
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);
    this.loadingData.set(false);
    this.savingEntity.set(false);
    this.toaster.success(message, 'Success', TOASTER_CONFIGURATION);
  }

  private primeWizardAmountEntry(): void {
    const v = this.formGroup.get('incoming')?.value;
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
    this.syncIncomingFromEntry(this.amountEntry());
  }

  private syncIncomingFromEntry(raw: string): void {
    const ctrl = this.formGroup.get('incoming');
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
      this.syncIncomingFromEntry(this.amountEntry());
    }
    const m = this.formGroup.get('incoming');
    const cur = this.formGroup.get('currency');
    m?.markAsTouched();
    cur?.markAsTouched();
    return !!(m?.valid && cur?.valid);
  }

  private getCategories(): void {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    // Backend returns categories already sorted by usage count (most used first).
    this.categoryService
      .findByUsage(this.accountService.getAccount(), CategoryType.INCOME)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((rows: Category[]) => {
          const list = Array.isArray(rows) ? rows : [];
          this.categories.set(
            list.filter(
              (c: Category) => !c?.categoryType || c.categoryType === CategoryType.INCOME,
            ),
          );
        }),
        observeOn(asyncScheduler),
        tap(() => {
          this.loadingData.set(false);
        }),
        filter(() => this.isEditMode),
        mergeMap(() => this.getIncome()),
      )
      .subscribe();
  }

  private getIncome(): Observable<any> {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    return this.incomeService.findOne(this.id!).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((inc) => {
        this.formGroup.patchValue(inc);
        this.cdr.markForCheck();
      }),
      observeOn(asyncScheduler),
      tap(() => {
        this.loadingData.set(false);
      }),
    );
  }
}
