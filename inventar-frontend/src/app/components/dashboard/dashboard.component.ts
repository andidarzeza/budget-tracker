import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inOutAnimation } from 'src/app/animations';
import { HttpParams } from '@angular/common/http';
import {
  Account,
  CategoryType,
  CurrencyTotalDTO,
  DashboardDTO,
  Expense,
  Income,
  RangeType,
  TimelineExpenseDTO,
  TimelineIncomeDTO,
} from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { ChartUtils } from 'src/app/utils/chart';
import { buildParams } from 'src/app/utils/param-bulder';
import {
  CREATE_DIALOG_DESKTOP_CONFIGURATION,
  CREATE_DIALOG_MOBILE_CONFIGURATION,
  TOASTER_CONFIGURATION,
} from 'src/environments/environment';
import { AllTimeHeaderComponent } from './all-time-header/all-time-header.component';
import { CustomRangePickerComponent } from './custom-range-picker/custom-range-picker.component';
import { DayPickerComponent } from './day-picker/day-picker.component';
import { EditBalanceComponent } from './edit-balance/edit-balance.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { WeekPickerComponent } from './week-picker/week-picker.component';
import { YearPickerComponent } from './year-picker/year-picker.component';

interface CurrencyBalance {
  currency: string;
  income: number;
  expense: number;
  net: number;
}

interface BalanceRow {
  currency: string;
  amount: number;
}

const BALANCE_HIDDEN_KEY = 'dashboard.balanceHidden';
const SELECTED_RANGE_KEY = 'dashboard.selectedRange';
/** Valid `RangeType` values, used to validate a stored range before trusting it. */
const RANGE_VALUES: ReadonlySet<RangeType> = new Set<RangeType>([
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
  'MAX',
  'CUSTOM',
]);

/**
 * One breakdown row: a single (category, currency) pairing.
 * Backend returns multiple rows per category when transactions span currencies;
 * we render each as its own list entry so the layout mirrors the login preview
 * (icon · title · subtitle · amount) and we never need cross-currency math.
 */
interface CategoryRow {
  name: string;
  /** Material icon name; expense rows always have one, income rows fall back to a default. */
  icon: string;
  currency: string;
  total: number;
}

const EXPENSE_LINE = 'expense-line';
const INCOME_LINE = 'income-line';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DayPickerComponent,
    WeekPickerComponent,
    MonthPickerComponent,
    YearPickerComponent,
    AllTimeHeaderComponent,
    CustomRangePickerComponent,
    FlagPipe,
  ],
})
export class DashboardComponent implements AfterViewInit {
  readonly dashboardService = inject(DashboardService);
  readonly chartUtil = inject(ChartUtils);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly toasterService = inject(ToastrService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly accountService = inject(AccountService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointService = inject(BreakpointService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly incomeService = inject(IncomeService);
  private readonly categoryService = inject(CategoriesService);

  from!: Date;
  to!: Date;

  selectedRange = signal<RangeType>(DashboardComponent.readStoredRange());
  ranges: RangeType[] = ['DAY', 'WEEK', 'MONTH', 'YEAR', 'MAX', 'CUSTOM'];

  dashboardData = signal<DashboardDTO | null>(null);

  /** Current per-currency balance straight from the user's account (Edit balance dialog updates this). */
  account = signal<Account | null>(null);
  /** Privacy toggle — value persisted in localStorage so it sticks across reloads. */
  balanceHidden = signal<boolean>(localStorage.getItem(BALANCE_HIDDEN_KEY) === '1');

  balanceRows = computed<BalanceRow[]>(() => {
    const balance = this.account()?.balance ?? {};
    return Object.entries(balance)
      .filter(([, amount]) => typeof amount === 'number' && amount !== 0)
      .map(([currency, amount]) => ({ currency, amount: amount as number }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  });

  /** Per-currency Income / Expense / Net for the KPI strip. */
  balances = computed<CurrencyBalance[]>(() => {
    const data = this.dashboardData();
    if (!data) return [];
    return DashboardComponent.mergeBalances(
      data.incomeTotalsByCurrency,
      data.expenseTotalsByCurrency,
    );
  });

  /** True when the loaded dashboard period has no income, expense, or category rows. */
  hasNoData = computed<boolean>(() => {
    const d = this.dashboardData();
    if (!d) return false;
    const empty = (a?: { length?: number }) => !a || (a.length ?? 0) === 0;
    return (
      empty(d.incomeTotalsByCurrency) &&
      empty(d.expenseTotalsByCurrency) &&
      empty(d.expensesInfo) &&
      empty(d.incomesInfo)
    );
  });

  /**
   * Flat breakdowns: one row per (category, currency), sorted by total desc.
   * Mirrors the login preview list — no cross-currency aggregation, since
   * €100 + $100 ≠ 200 of anything.
   */
  expenseRows = computed<CategoryRow[]>(() =>
    DashboardComponent.toRows(this.dashboardData()?.expensesInfo, 'shopping_cart'),
  );

  incomeRows = computed<CategoryRow[]>(() =>
    DashboardComponent.toRows(this.dashboardData()?.incomesInfo, 'trending_up'),
  );

  /** Loaded-and-empty (not "still loading"). Drives the breakdown empty state. */
  expensesEmpty = computed<boolean>(() => {
    const d = this.dashboardData();
    return !!d && !this.expenseRows().length;
  });

  incomesEmpty = computed<boolean>(() => {
    const d = this.dashboardData();
    return !!d && !this.incomeRows().length;
  });

  /** Category-name → category-id maps so we can resolve a breakdown row
      (which knows only the display name) to the id the filter API expects. */
  private expenseCategoriesByName = signal<Map<string, string>>(new Map());
  private incomeCategoriesByName = signal<Map<string, string>>(new Map());

  /** "Story" panel state — when set, a list of transactions for the selected
      category + currency + current period renders above the breakdown card. */
  storyOpen = signal(false);
  storyKind = signal<'expense' | 'income'>('expense');
  storyCategory = signal<CategoryRow | null>(null);
  storyItems = signal<(Expense | Income)[]>([]);
  storyLoading = signal(false);

  constructor() {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.fetchAccount();
    this.fetchCategoryMaps();
  }

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
    Chart.register(...registerables);
    this.chartUtil.createLineChart(EXPENSE_LINE);
    this.chartUtil.createLineChart(INCOME_LINE);
    this.chartUtil.resizeDashboardCharts();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.chartUtil.resizeDashboardCharts();
  }

  toggleBalanceVisibility(): void {
    const next = !this.balanceHidden();
    this.balanceHidden.set(next);
    localStorage.setItem(BALANCE_HIDDEN_KEY, next ? '1' : '0');
  }

  openEditBalance(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    // Match the create-dialog configuration used by every other dialog so the wrapper
    // (header / footer / mobile fullscreen) renders consistently.
    const mobile = this.breakpointService.matchesMobileCreateLayout();
    const ref = this.dialog.open(EditBalanceComponent, {
      panelClass: mobile ? ['create-dialog', 'create-dialog--fullscreen'] : ['create-dialog'],
      ...(mobile ? CREATE_DIALOG_MOBILE_CONFIGURATION : CREATE_DIALOG_DESKTOP_CONFIGURATION),
      autoFocus: false,
      data: {
        accountId,
        balance: this.account()?.balance ?? {},
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        // Dialog returns the saved Account on success, null on cancel.
        if (updated) {
          this.account.set(updated);
        }
      });
  }

  onRangeSelect(range: RangeType): void {
    if (this.selectedRange() === range) {
      return;
    }
    this.selectedRange.set(range);
    // Persist so the next visit to /dashboard re-opens the same range without
    // forcing the user to re-pick (mirrors the balance-visibility toggle).
    localStorage.setItem(SELECTED_RANGE_KEY, range);
    // Switching ranges remounts the picker; its ngOnInit emits onChange,
    // which calls onDateSelected and triggers all data fetches with the new range.
  }

  onDateSelected(dateRange: { from: Date; to: Date }): void {
    this.from = dateRange.from;
    this.to = dateRange.to;
    this.refresh();
  }

  catchError = () => {
    this.toasterService.error('An Error Occured', 'Server Error', TOASTER_CONFIGURATION);
    return of(null);
  };

  get period() {
    return { from: this.from, to: this.to };
  }

  private fetchAccount(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    this.accountService
      .findOne(accountId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null)),
      )
      .subscribe((account) => this.account.set(account));
  }

  /**
   * Build name → id lookups for both expense and income categories. The
   * breakdown rows only carry the display name; we need the id to filter
   * the expense / income endpoints when a user drills into a row.
   */
  private fetchCategoryMaps(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    const buildMap = (rows: any[] | null): Map<string, string> => {
      const map = new Map<string, string>();
      for (const c of rows ?? []) {
        if (c?.category && c?.id) map.set(c.category, c.id);
      }
      return map;
    };
    this.categoryService
      .findByUsage(accountId, CategoryType.EXPENSE)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
      .subscribe((rows: any) => this.expenseCategoriesByName.set(buildMap(rows)));
    this.categoryService
      .findByUsage(accountId, CategoryType.INCOME)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
      .subscribe((rows: any) => this.incomeCategoriesByName.set(buildMap(rows)));
  }

  /**
   * Open the drill-down "story" panel for a breakdown row: fetch the actual
   * transactions in this (category, currency) for the current dashboard
   * period and render them above the breakdown card. Date filtering is
   * applied client-side so we don't depend on the backend honoring
   * `from`/`to` on the expense/income list endpoint.
   */
  openCategoryStory(kind: 'expense' | 'income', row: CategoryRow): void {
    this.storyOpen.set(true);
    this.storyKind.set(kind);
    this.storyCategory.set(row);
    this.storyItems.set([]);
    this.storyLoading.set(true);

    const accountId = this.accountService.getAccount();
    if (!accountId) {
      this.storyLoading.set(false);
      return;
    }
    const map = kind === 'expense' ? this.expenseCategoriesByName() : this.incomeCategoriesByName();
    const categoryId = map.get(row.name);
    if (!categoryId) {
      this.storyLoading.set(false);
      return;
    }

    const baseParams = new HttpParams()
      .append('account', accountId)
      .append('category', categoryId);
    const params = buildParams(0, 500, 'createdTime,desc', baseParams);
    const service$ =
      kind === 'expense'
        ? this.expenseService.findAll(params)
        : this.incomeService.findAll(params);

    const fromMs = this.from?.getTime() ?? Number.NEGATIVE_INFINITY;
    const toMs = this.to?.getTime() ?? Number.POSITIVE_INFINITY;

    service$
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe((res: any) => {
        const all = (res?.data ?? res ?? []) as (Expense | Income)[];
        const inPeriod = all
          .filter((e: any) => (e?.currency ?? row.currency) === row.currency)
          .filter((e: any) => {
            const t = new Date(e.createdTime).getTime();
            return Number.isFinite(t) && t >= fromMs && t <= toMs;
          });
        this.storyItems.set(inPeriod);
        this.storyLoading.set(false);
      });
  }

  closeStory(): void {
    this.storyOpen.set(false);
    this.storyCategory.set(null);
    this.storyItems.set([]);
  }

  /**
   * Amount accessor for the story rows — expenses use `moneySpent`, incomes
   * use `incoming`. Keeps the template a single loop instead of duplicating
   * it per kind.
   */
  storyAmount(item: any): number {
    return Number(item?.moneySpent ?? item?.incoming ?? 0);
  }

  private refresh(): void {
    this.fetchDashboardData();
    this.fetchExpenseTimeline();
    this.fetchIncomeTimeline();
  }

  private fetchDashboardData(): void {
    this.dashboardService
      .getDashboardData(this.from, this.to, this.selectedRange())
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(this.catchError))
      .subscribe((data: DashboardDTO | null) => {
        this.dashboardData.set(data);
        // The account balance is mutated by background services (expenses, contributions);
        // refresh it whenever fresh dashboard data arrives.
        this.fetchAccount();
      });
  }

  private fetchExpenseTimeline(): void {
    this.dashboardService
      .expensesTimeline(this.period, this.selectedRange())
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(this.catchError))
      .subscribe((timeline) => this.updateLineSeries(EXPENSE_LINE, timeline as any, 'expense'));
  }

  private fetchIncomeTimeline(): void {
    this.dashboardService
      .incomesTimeline(this.period, this.selectedRange())
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(this.catchError))
      .subscribe((timeline) => this.updateLineSeries(INCOME_LINE, timeline as any, 'income'));
  }

  /**
   * Restore the last-selected range from localStorage, falling back to MONTH.
   * Validated against `RANGE_VALUES` so a corrupted/stale entry can't crash
   * the component or send an unknown range string to the backend.
   */
  private static readStoredRange(): RangeType {
    const stored = localStorage.getItem(SELECTED_RANGE_KEY) as RangeType | null;
    return stored && RANGE_VALUES.has(stored) ? stored : 'MONTH';
  }

  /**
   * Flatten backend `(category, currency, total)` rows for direct rendering,
   * sorted by total descending. No cross-currency aggregation — each row owns
   * exactly one currency, which is the only honest ordering without FX rates.
   */
  private static toRows(
    items: ({ _id: string; total: number; currency?: string; icon?: string })[] | null | undefined,
    fallbackIcon: string,
  ): CategoryRow[] {
    if (!items?.length) return [];
    return items
      .filter((it) => (it.total ?? 0) > 0)
      .map((it) => ({
        name: it._id,
        icon: it.icon || fallbackIcon,
        currency: it.currency ?? 'Other',
        total: it.total ?? 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Build per-currency line datasets for a timeline. `kind` selects whether to read
   * `dailyExpense` or `income` from the DTO and what label/series count to expect.
   */
  private updateLineSeries(
    canvasId: string,
    timeline: TimelineExpenseDTO[] | TimelineIncomeDTO[] | null | undefined,
    kind: 'expense' | 'income',
  ): void {
    this.chartUtil.updateTimelineLabels(canvasId, this.selectedRange(), {
      year: this.from?.getFullYear() ?? new Date().getFullYear(),
      month: (this.from?.getMonth() ?? new Date().getMonth()) + 1,
      from: this.from,
      to: this.to,
    });

    if (this.selectedRange() === 'MAX') {
      this.chartUtil.updateLineSeries(canvasId, []);
      return;
    }

    const rows = Array.isArray(timeline) ? timeline : [];
    const valueOf = (r: TimelineExpenseDTO | TimelineIncomeDTO): number =>
      kind === 'expense'
        ? ((r as TimelineExpenseDTO).dailyExpense ?? 0)
        : ((r as TimelineIncomeDTO).income ?? 0);

    const currencyLabel = (c: string | null | undefined): string =>
      c && String(c).trim() ? String(c).trim() : 'Other';

    const currencies = [...new Set(rows.map((r) => currencyLabel(r.currency)))].sort();

    const valueByKey = new Map<string, number>();
    for (const r of rows) {
      const bucket = this.normalizeBucketId(r._id);
      valueByKey.set(`${bucket}|${currencyLabel(r.currency)}`, valueOf(r));
    }

    const series = currencies.map((cur) => {
      const data: number[] = [];
      switch (this.selectedRange()) {
        case 'DAY':
          for (let h = 0; h < 24; h++) {
            data.push(valueByKey.get(`${String(h).padStart(2, '0')}|${cur}`) ?? 0);
          }
          break;
        case 'WEEK':
          for (let d = 1; d <= 7; d++) {
            data.push(valueByKey.get(`${d}|${cur}`) ?? 0);
          }
          break;
        case 'MONTH': {
          const dim = this.daysInMonth(this.from.getFullYear(), this.from.getMonth() + 1);
          for (let day = 1; day <= dim; day++) {
            data.push(valueByKey.get(`${String(day).padStart(2, '0')}|${cur}`) ?? 0);
          }
          break;
        }
        case 'YEAR':
          for (let m = 1; m <= 12; m++) {
            data.push(valueByKey.get(`${String(m).padStart(2, '0')}|${cur}`) ?? 0);
          }
          break;
        case 'CUSTOM': {
          // Backend buckets CUSTOM by full `yyyy-MM-dd`, so we walk every day
          // in the selected window and look up the matching key. `to` is
          // exclusive (start of the day after the last included day) — same
          // convention as the other pickers.
          const cursor = new Date(
            this.from.getFullYear(),
            this.from.getMonth(),
            this.from.getDate(),
          );
          const end = new Date(this.to.getFullYear(), this.to.getMonth(), this.to.getDate());
          while (cursor < end) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
            data.push(valueByKey.get(`${key}|${cur}`) ?? 0);
            cursor.setDate(cursor.getDate() + 1);
          }
          break;
        }
      }
      return { label: cur, data };
    });

    this.chartUtil.updateLineSeries(canvasId, series);
  }

  /**
   * Aligns API bucket ids with the keys used to look up chart values.
   * For numeric ranges (DAY hour, MONTH day-of-month, YEAR month-of-year) we
   * pad to 2 digits so `'5'` matches the lookup key `'05'`. WEEK and the
   * date-string ranges (MAX `'yyyy-MM'`, CUSTOM `'yyyy-MM-dd'`) are left
   * untouched — padding `'2026-05-09'` would corrupt it to `'2026'`.
   */
  private normalizeBucketId(raw: string | number | undefined | null): string {
    if (raw === undefined || raw === null) return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (/^\d+$/.test(s) && this.selectedRange() !== 'WEEK') {
      return s.padStart(2, '0');
    }
    return s;
  }

  private daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /** Combine income and expense currency totals into one row per currency for the KPI strip. */
  private static mergeBalances(
    incomes?: CurrencyTotalDTO[] | null,
    expenses?: CurrencyTotalDTO[] | null,
  ): CurrencyBalance[] {
    const inc = new Map<string, number>();
    for (const c of incomes ?? []) inc.set(c._id, c.total ?? 0);
    const exp = new Map<string, number>();
    for (const c of expenses ?? []) exp.set(c._id, c.total ?? 0);

    const currencies = [...new Set([...inc.keys(), ...exp.keys()])].sort();
    return currencies.map((currency) => {
      const income = inc.get(currency) ?? 0;
      const expense = exp.get(currency) ?? 0;
      return { currency, income, expense, net: income - expense };
    });
  }
}
