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
import { filter, mergeMap, observeOn, takeUntil, tap } from 'rxjs/operators';
import { Category, CategoryType, EntityType, Income } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddIncomeComponent extends Unsubscribe implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointService = inject(BreakpointService);

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

  public formGroup: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public income: Income,
    public sharedService: SharedService,
    private toaster: ToastrService,
    private dialogRef: MatDialogRef<AddIncomeComponent>,
    private formBuilder: UntypedFormBuilder,
    private incomeService: IncomeService,
    private categoryService: CategoriesService,
    private accountService: AccountService
  ) {
    super();
    this.isEditMode = this.income != null;
    this.formGroup = this.formBuilder.group({
      description: [''],
      categoryID: ['', Validators.required],
      incoming: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }

  public baseCurrency = localStorage.getItem('baseCurrency');

  currencies = CURRENCIES;
  public entity: EntityType = EntityType.INCOME;

  readonly categories = signal<Category[]>([]);

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

  ngOnInit(): void {
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
      n.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false })
    );
    this.syncIncomingFromEntry(this.amountEntry());
  }

  private syncIncomingFromEntry(raw: string): void {
    const ctrl = this.formGroup.get('incoming');
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
        takeUntil(this.unsubscribe$),
        tap((rows: Category[]) => {
          const list = Array.isArray(rows) ? rows : [];
          this.categories.set(
            list.filter(
              (c: Category) => !c?.categoryType || c.categoryType === CategoryType.INCOME
            )
          );
        }),
        observeOn(asyncScheduler),
        tap(() => {
          this.loadingData.set(false);
        }),
        filter(() => this.isEditMode),
        mergeMap(() => this.getIncome())
      )
      .subscribe();
  }

  private getIncome(): Observable<any> {
    this.loadingMessage.set('Loading…');
    this.loadingData.set(true);
    return this.incomeService.findOne(this.id).pipe(
      takeUntil(this.unsubscribe$),
      tap((inc) => {
        this.formGroup.patchValue(inc);
        this.cdr.markForCheck();
      }),
      observeOn(asyncScheduler),
      tap(() => {
        this.loadingData.set(false);
      })
    );
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
          .update(this.income.id, payload)
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
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
          .pipe(takeUntil(this.unsubscribe$), observeOn(asyncScheduler))
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
    this.dialogRef.close(update);
  }

  onSaveSuccess(message: string): void {
    this.closeDialog(true);
    this.loadingData.set(false);
    this.savingEntity.set(false);
    this.toaster.success(message, 'Success', TOASTER_CONFIGURATION);
  }

  get id() {
    return this.income?.id;
  }
}
