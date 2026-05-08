import { AfterViewInit, ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import {
  CREATE_DIALOG_DESKTOP_CONFIGURATION,
  CREATE_DIALOG_MOBILE_CONFIGURATION,
  TOASTER_CONFIGURATION
} from 'src/environments/environment';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  Account,
  CurrencyTotalDTO,
  DashboardDTO,
  RangeType,
  TimelineExpenseDTO,
  TimelineIncomeDTO
} from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { inOutAnimation } from 'src/app/animations';
import { of } from 'rxjs';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { EditBalanceComponent } from './edit-balance/edit-balance.component';

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

@Component({ standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends Unsubscribe implements AfterViewInit {

  from!: Date;
  to!: Date;

  selectedRange = signal<RangeType>('MONTH');
  ranges: RangeType[] = ['DAY', 'WEEK', 'MONTH', 'YEAR', 'MAX'];

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
    return DashboardComponent.mergeBalances(data.incomeTotalsByCurrency, data.expenseTotalsByCurrency);
  });

  /** True when the loaded dashboard period has no income, expense, or category rows. */
  hasNoData = computed<boolean>(() => {
    const d = this.dashboardData();
    if (!d) return false;
    const empty = (a?: { length?: number }) => !a || (a.length ?? 0) === 0;
    return empty(d.incomeTotalsByCurrency) && empty(d.expenseTotalsByCurrency)
      && empty(d.expensesInfo) && empty(d.incomesInfo);
  });

  /**
   * Flat breakdowns: one row per (category, currency), sorted by total desc.
   * Mirrors the login preview list — no cross-currency aggregation, since
   * €100 + $100 ≠ 200 of anything.
   */
  expenseRows = computed<CategoryRow[]>(() =>
    DashboardComponent.toRows(this.dashboardData()?.expensesInfo, 'shopping_cart')
  );

  incomeRows = computed<CategoryRow[]>(() =>
    DashboardComponent.toRows(this.dashboardData()?.incomesInfo, 'trending_up')
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

  readonly dashboardService = inject(DashboardService);
  readonly chartUtil = inject(ChartUtils);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly toasterService = inject(ToastrService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly accountService = inject(AccountService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointService = inject(BreakpointService);

  constructor() {
    super();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.fetchAccount();
  }

  private fetchAccount(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    this.accountService.findOne(accountId)
      .pipe(takeUntil(this.unsubscribe$), catchError(() => of(null)))
      .subscribe(account => this.account.set(account));
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
        balance: this.account()?.balance ?? {}
      }
    });
    ref.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(updated => {
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
    // Switching ranges remounts the picker; its ngOnInit emits onChange,
    // which calls onDateSelected and triggers all data fetches with the new range.
  }

  onDateSelected(dateRange: { from: Date; to: Date }): void {
    this.from = dateRange.from;
    this.to = dateRange.to;
    this.refresh();
  }

  private refresh(): void {
    this.fetchDashboardData();
    this.fetchExpenseTimeline();
    this.fetchIncomeTimeline();
  }

  private fetchDashboardData(): void {
    this.dashboardService
      .getDashboardData(this.from, this.to, this.selectedRange())
      .pipe(takeUntil(this.unsubscribe$), catchError(this.catchError))
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
      .pipe(takeUntil(this.unsubscribe$), catchError(this.catchError))
      .subscribe((timeline) => this.updateLineSeries(EXPENSE_LINE, timeline as any, 'expense'));
  }

  private fetchIncomeTimeline(): void {
    this.dashboardService
      .incomesTimeline(this.period, this.selectedRange())
      .pipe(takeUntil(this.unsubscribe$), catchError(this.catchError))
      .subscribe((timeline) => this.updateLineSeries(INCOME_LINE, timeline as any, 'income'));
  }

  catchError = () => {
    this.toasterService.error('An Error Occured', 'Server Error', TOASTER_CONFIGURATION);
    return of(null);
  }

  /**
   * Flatten backend `(category, currency, total)` rows for direct rendering,
   * sorted by total descending. No cross-currency aggregation — each row owns
   * exactly one currency, which is the only honest ordering without FX rates.
   */
  private static toRows(
    items: ({ _id: string; total: number; currency?: string; icon?: string })[] | null | undefined,
    fallbackIcon: string
  ): CategoryRow[] {
    if (!items?.length) return [];
    return items
      .filter(it => (it.total ?? 0) > 0)
      .map(it => ({
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
    kind: 'expense' | 'income'
  ): void {
    this.chartUtil.updateTimelineLabels(canvasId, this.selectedRange(), {
      year: this.from?.getFullYear() ?? new Date().getFullYear(),
      month: (this.from?.getMonth() ?? new Date().getMonth()) + 1,
    });

    if (this.selectedRange() === 'MAX') {
      this.chartUtil.updateLineSeries(canvasId, []);
      return;
    }

    const rows = Array.isArray(timeline) ? timeline : [];
    const valueOf = (r: TimelineExpenseDTO | TimelineIncomeDTO): number =>
      kind === 'expense' ? ((r as TimelineExpenseDTO).dailyExpense ?? 0) : ((r as TimelineIncomeDTO).income ?? 0);

    const currencyLabel = (c: string | null | undefined): string =>
      c && String(c).trim() ? String(c).trim() : 'Other';

    const currencies = [...new Set(rows.map(r => currencyLabel(r.currency)))].sort();

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
      }
      return { label: cur, data };
    });

    this.chartUtil.updateLineSeries(canvasId, series);
  }

  /** Aligns API bucket ids (hour/day/month strings) with the keys used to look up chart values. */
  private normalizeBucketId(raw: string | number | undefined | null): string {
    if (raw === undefined || raw === null) return '';
    const s = String(raw).trim();
    if (!s) return '';
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && this.selectedRange() !== 'WEEK') {
      return String(n).padStart(2, '0');
    }
    return s;
  }

  private daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /** Combine income and expense currency totals into one row per currency for the KPI strip. */
  private static mergeBalances(
    incomes?: CurrencyTotalDTO[] | null,
    expenses?: CurrencyTotalDTO[] | null
  ): CurrencyBalance[] {
    const inc = new Map<string, number>();
    for (const c of incomes ?? []) inc.set(c._id, c.total ?? 0);
    const exp = new Map<string, number>();
    for (const c of expenses ?? []) exp.set(c._id, c.total ?? 0);

    const currencies = [...new Set([...inc.keys(), ...exp.keys()])].sort();
    return currencies.map(currency => {
      const income = inc.get(currency) ?? 0;
      const expense = exp.get(currency) ?? 0;
      return { currency, income, expense, net: income - expense };
    });
  }

  get period() {
    return { from: this.from, to: this.to };
  }
}
