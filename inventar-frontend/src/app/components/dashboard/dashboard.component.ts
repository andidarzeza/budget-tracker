import { AfterViewInit, ChangeDetectionStrategy, Component, computed, HostListener, signal } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils, DoughnutDataPoint } from 'src/app/utils/chart';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  CurrencyTotalDTO,
  DashboardDTO,
  RangeType,
  TimelineExpenseDTO,
  TimelineIncomeDTO
} from 'src/app/models/models';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { inOutAnimation } from 'src/app/animations';
import { of } from 'rxjs';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

interface CurrencyBalance {
  currency: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryGroupRow {
  currency: string;
  total: number;
}

interface CategoryGroup {
  /** Category name (used as the user-visible label and the row identity). */
  name: string;
  /** Optional Material icon name; absent for income groups. */
  icon?: string;
  /** Per-currency totals belonging to this category, sorted desc by total. */
  rows: CategoryGroupRow[];
}

const EXPENSE_LINE = 'expense-line';
const INCOME_LINE = 'income-line';
const EXPENSE_DOUGHNUT = 'expense-doughnut';
const INCOME_DOUGHNUT = 'income-doughnut';

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
   * Currency-aware breakdowns: backend returns one row per (category, currency).
   * Categories are grouped so each shows its per-currency totals inline,
   * since summing across currencies isn't meaningful (€100 + $100 ≠ 200 of anything).
   */
  expenseGroups = computed<CategoryGroup[]>(() =>
    DashboardComponent.groupByCategory(this.dashboardData()?.expensesInfo)
  );

  incomeGroups = computed<CategoryGroup[]>(() =>
    DashboardComponent.groupByCategory(this.dashboardData()?.incomesInfo)
  );

  /**
   * Doughnut can only render one currency at a time without misleading the viewer.
   * We pick the currency with the largest total so the chart reflects where most
   * of the user's money is, and show its code as a label next to the chart.
   */
  primaryExpenseCurrency = computed<string | null>(() =>
    DashboardComponent.pickPrimaryCurrency(this.dashboardData()?.expensesInfo)
  );

  primaryIncomeCurrency = computed<string | null>(() =>
    DashboardComponent.pickPrimaryCurrency(this.dashboardData()?.incomesInfo)
  );

  /** Loaded-and-empty (not "still loading"). Drives the breakdown empty state. */
  expensesEmpty = computed<boolean>(() => {
    const d = this.dashboardData();
    return !!d && !this.expenseGroups().length;
  });

  incomesEmpty = computed<boolean>(() => {
    const d = this.dashboardData();
    return !!d && !this.incomeGroups().length;
  });

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
    Chart.register(...registerables);
    this.chartUtil.createLineChart(EXPENSE_LINE);
    this.chartUtil.createLineChart(INCOME_LINE);
    this.chartUtil.createDoughnutChart(EXPENSE_DOUGHNUT);
    this.chartUtil.createDoughnutChart(INCOME_DOUGHNUT);
    this.chartUtil.resizeDashboardCharts();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.chartUtil.resizeDashboardCharts();
  }

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    private toasterService: ToastrService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
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
        this.refreshBreakdownDoughnuts();
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
   * Push the primary-currency slice of each breakdown into the doughnuts.
   * Doughnuts can only meaningfully render one currency at a time; the rest are
   * communicated by the per-category list under the chart.
   */
  private refreshBreakdownDoughnuts(): void {
    this.chartUtil.setDoughnutData(
      EXPENSE_DOUGHNUT,
      this.toPrimaryCurrencyPoints(this.dashboardData()?.expensesInfo, this.primaryExpenseCurrency())
    );
    this.chartUtil.setDoughnutData(
      INCOME_DOUGHNUT,
      this.toPrimaryCurrencyPoints(this.dashboardData()?.incomesInfo, this.primaryIncomeCurrency())
    );
    // The doughnut wrapper toggles display:none ↔ block when the empty state appears /
    // disappears, so we resize after the swap to make the chart fit the new container.
    this.chartUtil.resizeDashboardCharts();
  }

  private toPrimaryCurrencyPoints(
    items: { _id: string; total: number; currency?: string }[] | null | undefined,
    primaryCurrency: string | null
  ): DoughnutDataPoint[] {
    if (!items?.length || !primaryCurrency) return [];
    return items
      .filter(it => (it.currency ?? 'Other') === primaryCurrency && (it.total ?? 0) > 0)
      .map(it => ({ label: it._id, value: it.total ?? 0 }));
  }

  /** Currency with the largest sum across rows, or null when there's no data. */
  private static pickPrimaryCurrency(
    items: { total?: number; currency?: string }[] | null | undefined
  ): string | null {
    if (!items?.length) return null;
    const totals = new Map<string, number>();
    for (const it of items) {
      const cur = it.currency ?? 'Other';
      totals.set(cur, (totals.get(cur) ?? 0) + (it.total ?? 0));
    }
    if (!totals.size) return null;
    return [...totals.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Collapse `(category, currency, total)` rows into one entry per category, with
   * its per-currency totals listed inline. Sorted by largest single-currency total
   * descending, which is an honest ordering without needing exchange rates.
   */
  private static groupByCategory(
    items: ({ _id: string; total: number; currency?: string; icon?: string })[] | null | undefined
  ): CategoryGroup[] {
    if (!items?.length) return [];
    const map = new Map<string, CategoryGroup>();
    for (const it of items) {
      const key = it._id;
      let group = map.get(key);
      if (!group) {
        group = { name: it._id, icon: it.icon, rows: [] };
        map.set(key, group);
      } else if (!group.icon && it.icon) {
        group.icon = it.icon;
      }
      group.rows.push({ currency: it.currency ?? 'Other', total: it.total ?? 0 });
    }
    for (const g of map.values()) {
      g.rows.sort((a, b) => b.total - a.total);
    }
    return [...map.values()].sort(
      (a, b) => Math.max(...b.rows.map(r => r.total)) - Math.max(...a.rows.map(r => r.total))
    );
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
