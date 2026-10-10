import { iosTileColorForName } from 'src/app/shared/ios/ios-colors';
import { RevealNumberDirective } from 'src/app/shared/reveal-number/reveal-number.directive';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inOutAnimation } from 'src/app/animations';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  CategoryType,
  CurrencyTotalDTO,
  DashboardDTO,
  Expense,
  Income,
  ProjectView,
  RangeType,
  Wallet,
} from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { WalletService } from 'src/app/services/pages/wallet.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { buildParams } from 'src/app/utils/param-bulder';
import {
  CREATE_DIALOG_DESKTOP_CONFIGURATION,
  CREATE_DIALOG_MOBILE_CONFIGURATION,
  TOASTER_CONFIGURATION,
} from 'src/environments/environment';
import { AllTimeHeaderComponent } from './all-time-header/all-time-header.component';
import { BalanceDetailComponent, BalanceDetailData } from './balance-detail/balance-detail.component';
import { CustomRangePickerComponent } from './custom-range-picker/custom-range-picker.component';
import { DayPickerComponent } from './day-picker/day-picker.component';
import { ManageWalletsComponent } from './manage-wallets/manage-wallets.component';
import { TransferMoneyComponent } from './transfer-money/transfer-money.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { WeekPickerComponent } from './week-picker/week-picker.component';
import { YearPickerComponent } from './year-picker/year-picker.component';

interface CurrencyBalance {
  currency: string;
  income: number;
  expense: number;
  net: number;
}

/** A currency's savings: what was kept, as a share of what came in. */
interface Savings extends CurrencyBalance {
  /** Net ÷ income in %, rounded down (so 99.6% reads 99%, and 100% means
   *  nothing was spent), or null with no income to compare to. */
  rate: number | null;
  /** Net minus last month's net, or null when last month has no data. */
  vsLastMonth?: number | null;
}

function toSavings(b: CurrencyBalance): Savings {
  return { ...b, rate: b.income > 0 ? Math.floor((b.net / b.income) * 100) : null };
}

interface BalanceRow {
  currency: string;
  amount: number;
  name?: string;
}

/** One recap row: a running total for a single currency. */
interface CurrencyTotal {
  currency: string;
  total: number;
}

/** A project rendered on the balance dashboard: saved-vs-target in the target currency. */
interface ProjectCard {
  id?: string;
  name: string;
  icon: string;
  currency: string;
  saved: number;
  target: number;
  pct: number;
}

const BALANCE_HIDDEN_KEY = 'dashboard.balanceHidden';
const DASHBOARD_TAB_KEY = 'dashboard.tab';
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


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', './dashboard-ios.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RevealNumberDirective,
    CommonModule,
    MatCardModule,
    MatIconModule,
    DayPickerComponent,
    WeekPickerComponent,
    MonthPickerComponent,
    YearPickerComponent,
    AllTimeHeaderComponent,
    CustomRangePickerComponent,
    PillButtonComponent,
    FlagPipe,
    ...TOOLTIP_IMPORTS,
  ],
})
export class DashboardComponent implements AfterViewInit {
  /** Shown above the large title. */
  readonly today = new Date();

  readonly dashboardService = inject(DashboardService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly toasterService = inject(ToastrService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly accountService = inject(AccountService);
  private readonly dialog = inject(MatDialog);
  readonly breakpointService = inject(BreakpointService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly incomeService = inject(IncomeService);
  private readonly categoryService = inject(CategoriesService);
  private readonly walletService = inject(WalletService);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  from!: Date;
  to!: Date;

  selectedRange = signal<RangeType>(DashboardComponent.readStoredRange());
  ranges: RangeType[] = ['DAY', 'WEEK', 'MONTH', 'YEAR', 'MAX', 'CUSTOM'];

  dashboardData = signal<DashboardDTO | null>(null);

  /** Money sources (bank + cash) for the active workspace. */
  wallets = signal<Wallet[]>([]);
  /** Savings projects for the active workspace, with their per-currency totals. */
  projects = signal<ProjectView[]>([]);
  /** Privacy toggle — value persisted in localStorage so it sticks across reloads. */
  balanceHidden = signal<boolean>(localStorage.getItem(BALANCE_HIDDEN_KEY) === '1');
  /** Balance + projects overview collapsed state — persisted so it sticks across reloads. */
  /** Statistics (default) or the balances of each source. */
  activeTab = signal<'stats' | 'balances'>(localStorage.getItem(DASHBOARD_TAB_KEY) === 'balances' ? 'balances' : 'stats');

  /** Income / expense / net for the previous calendar month (the "vs September" comparison). */
  lastMonthBalances = signal<CurrencyBalance[]>([]);
  /** Same for the current calendar month so far (the "Saved this month" headline). */
  thisMonthBalances = signal<CurrencyBalance[]>([]);

  /** Headline: saved this month per currency, with rate and change vs last month. */
  readonly monthSavings = computed<Savings[]>(() =>
    this.thisMonthBalances().map((b) => {
      const last = this.lastMonthBalances().find((l) => l.currency === b.currency);
      return { ...toSavings(b), vsLastMonth: last ? b.net - last.net : null };
    }),
  );

  /** Selected-period savings (the period cards). */
  readonly periodSavings = computed<Savings[]>(() => this.balances().map(toSavings));

  /** The selected period is the current month — the headline already shows it. */
  readonly periodIsThisMonth = signal(false);
  readonly lastMonthName = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toLocaleDateString('en-US', { month: 'long' });

  /** Active bank accounts, sorted by name. */
  bankWallets = computed<Wallet[]>(() => this.activeWalletsOfType('BANK'));

  /** Bank whose branding a source card should wear, detected from its name. */
  bankBrand(wallet: Wallet): BankBrand | null {
    return BANK_BRANDS.find((brand) => brand.match.test(wallet.name ?? '')) ?? null;
  }
  /** Active cash holdings, sorted by name. */
  cashWallets = computed<Wallet[]>(() => this.activeWalletsOfType('CASH'));
  /** True when the workspace has at least one active source. */
  hasAnyWallet = computed<boolean>(() => this.wallets().some((w) => !w.archived));

  /** Project cards: saved-vs-target progress in each project's target currency. */
  projectCards = computed<ProjectCard[]>(() =>
    this.projects().map((v) => {
      const target = v.project.targetAmount || 0;
      const cur = (v.project.targetCurrency || '').toUpperCase();
      const saved = (v.totalsByCurrency || []).find((t) => (t._id || '').toUpperCase() === cur)?.total ?? 0;
      const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
      return {
        id: v.project.id,
        name: v.project.name,
        icon: v.project.icon || 'savings',
        currency: cur,
        saved,
        target,
        pct,
      };
    }),
  );

  private activeWalletsOfType(type: Wallet['type']): Wallet[] {
    return this.wallets()
      .filter((w) => !w.archived && w.type === type)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  /** Total money held across all active sources, grouped by currency. */
  accountTotals = computed<CurrencyTotal[]>(() =>
    DashboardComponent.sumByCurrency(
      this.wallets()
        .filter((w) => !w.archived)
        .map((w) => ({ currency: w.currency, total: w.balance ?? 0 })),
    ),
  );

  /** Money set aside in projects (all contributions), grouped by currency. */
  projectSavedTotals = computed<CurrencyTotal[]>(() =>
    DashboardComponent.sumByCurrency(
      this.projects().flatMap((v) =>
        (v.totalsByCurrency || []).map((t) => ({ currency: t._id, total: t.total ?? 0 })),
      ),
    ),
  );

  /** Everything you own: account balances plus money saved in projects, by currency. */
  grandTotals = computed<CurrencyTotal[]>(() =>
    DashboardComponent.sumByCurrency([...this.accountTotals(), ...this.projectSavedTotals()]),
  );

  /** Sum rows by (uppercased) currency, dropping blanks and net-zero currencies. */
  private static sumByCurrency(rows: CurrencyTotal[]): CurrencyTotal[] {
    const map = new Map<string, number>();
    for (const r of rows) {
      const currency = (r.currency || '').toUpperCase();
      if (!currency) continue;
      map.set(currency, (map.get(currency) ?? 0) + (r.total ?? 0));
    }
    return [...map.entries()]
      .map(([currency, total]) => ({ currency, total }))
      .filter((r) => r.total !== 0)
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }

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
    this.fetchWallets();
    this.fetchProjects();
    this.fetchCategoryMaps();
  }

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
  }

  toggleBalanceVisibility(): void {
    const next = !this.balanceHidden();
    this.balanceHidden.set(next);
    localStorage.setItem(BALANCE_HIDDEN_KEY, next ? '1' : '0');
  }

  goToProject(id?: string): void {
    if (id) {
      this.router.navigate(['/projects', id]);
    }
  }

  selectTab(tab: 'stats' | 'balances'): void {
    if (tab === this.activeTab()) return;
    // Slide the new tab in from the side it sits on (Statistics left, Balances right).
    this.slideFrom.set(tab === 'balances' ? 'right' : 'left');
    this.activeTab.set(tab);
    localStorage.setItem(DASHBOARD_TAB_KEY, tab);
  }

  /** Direction the newly selected tab animates in from. */
  readonly slideFrom = signal<'left' | 'right' | null>(null);
  private swipeStart: { x: number; y: number; t: number } | null = null;

  /** Horizontal swipe on the page switches Statistics ⇄ Balances. */
  onSwipeStart(event: TouchEvent): void {
    const t = event.touches[0];
    // Leave the segmented range switcher and the pickers to themselves.
    const fromControl = (event.target as Element).closest('.control-bar, .dash-tabs');
    this.swipeStart = event.touches.length === 1 && !fromControl ? { x: t.clientX, y: t.clientY, t: Date.now() } : null;
  }

  onSwipeEnd(event: TouchEvent): void {
    const start = this.swipeStart;
    this.swipeStart = null;
    if (!start) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const quick = Date.now() - start.t < 700;
    if (!quick || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    if (dx < 0 && this.activeTab() === 'stats') this.selectTab('balances');
    else if (dx > 0 && this.activeTab() === 'balances') this.selectTab('stats');
  }

  openWalletDetail(wallet: Wallet): void {
    // The chip itself only truncates on mobile (the desktop layout sizes
    // chips to content so the full amount is already visible). Skip the
    // dialog on desktop — opening it there would be redundant.
    if (!this.breakpointService.matchesMobileCreateLayout()) {
      return;
    }
    const data: BalanceDetailData = {
      currency: wallet.currency,
      amount: wallet.balance ?? 0,
      hidden: this.balanceHidden(),
    };
    this.dialog.open(BalanceDetailComponent, {
      data,
      panelClass: 'balance-detail-dialog',
      autoFocus: false,
      maxWidth: '92vw',
    });
  }

  openTransfer(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    const mobile = this.breakpointService.matchesMobileCreateLayout();
    const ref = this.dialog.open(TransferMoneyComponent, {
      panelClass: mobile ? ['create-dialog', 'create-dialog--fullscreen'] : ['create-dialog'],
      ...(mobile ? CREATE_DIALOG_MOBILE_CONFIGURATION : CREATE_DIALOG_DESKTOP_CONFIGURATION),
      autoFocus: false,
      data: { accountId },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((moved) => {
        if (moved) {
          this.fetchWallets();
        }
      });
  }

  openManageSources(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    // Match the create-dialog configuration used by every other dialog so the wrapper
    // (header / footer / mobile fullscreen) renders consistently.
    const mobile = this.breakpointService.matchesMobileCreateLayout();
    const ref = this.dialog.open(ManageWalletsComponent, {
      panelClass: mobile ? ['create-dialog', 'create-dialog--fullscreen'] : ['create-dialog'],
      ...(mobile ? CREATE_DIALOG_MOBILE_CONFIGURATION : CREATE_DIALOG_DESKTOP_CONFIGURATION),
      autoFocus: false,
      data: { accountId },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((changed) => {
        // Dialog returns true when any source was added / edited / removed.
        // A balance edit also books the difference as an income / expense,
        // so the statistics change too: reload everything (wallets included).
        if (changed) {
          this.refresh();
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
    const now = new Date();
    const from = new Date(dateRange.from);
    this.periodIsThisMonth.set(
      this.selectedRange() === 'MONTH' && from.getFullYear() === now.getFullYear() && from.getMonth() === now.getMonth(),
    );
    this.refresh();
  }

  catchError = () => {
    this.toasterService.error('An Error Occured', 'Server Error', TOASTER_CONFIGURATION);
    return of(null);
  };

  get period() {
    return { from: this.from, to: this.to };
  }

  private fetchWallets(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    this.walletService
      .list(accountId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([] as Wallet[])),
      )
      .subscribe((wallets) => this.wallets.set(wallets ?? []));
  }

  private fetchProjects(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    this.projectService
      .list(accountId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([] as ProjectView[])),
      )
      .subscribe((projects) => this.projects.set(projects ?? []));
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

  /** Settings-style tile colour for a breakdown row, stable per category name. */
  readonly tileColor = iosTileColorForName;

  /** A row's share (whole %) of all rows in the same currency. */
  sharePercent(rows: CategoryRow[], row: CategoryRow): number {
    const total = rows.filter((r) => r.currency === row.currency).reduce((sum, r) => sum + (r.total || 0), 0);
    return total > 0 ? Math.round((row.total / total) * 100) : 0;
  }

  /** Set after the first dashboard response; see `fetchDashboardData`. */
  private dashboardLoadedOnce = false;

  private refresh(): void {
    this.fetchDashboardData();
  }

  private fetchDashboardData(): void {
    this.dashboardService
      .getDashboardData(this.from, this.to, this.selectedRange())
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(this.catchError))
      .subscribe((data: DashboardDTO | null) => {
        this.dashboardData.set(data);
        // Source balances and project totals are mutated by expenses / incomes /
        // contributions; refresh them whenever fresh dashboard data arrives —
        // except the first time, since the constructor has just loaded them.
        if (this.dashboardLoadedOnce) {
          this.fetchWallets();
          this.fetchProjects();
        }
        this.dashboardLoadedOnce = true;
        this.fetchMonthSavings();
      });
  }

  /** This month's and last month's totals, for the two savings glance cards. */
  private fetchMonthSavings(): void {
    const now = new Date();
    this.fetchMonth(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
      new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
      this.lastMonthBalances,
    );
    this.fetchMonth(
      new Date(now.getFullYear(), now.getMonth(), 1),
      new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      this.thisMonthBalances,
    );
  }

  private fetchMonth(from: Date, to: Date, target: WritableSignal<CurrencyBalance[]>): void {
    this.dashboardService
      .getDashboardData(from, to, 'MONTH')
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(this.catchError))
      .subscribe((data: DashboardDTO | null) =>
        target.set(
          data ? DashboardComponent.mergeBalances(data.incomeTotalsByCurrency, data.expenseTotalsByCurrency) : [],
        ),
      );
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

interface BankBrand {
  key: string;
  name: string;
  logo: string;
  /** Optional variant for dark mode (e.g. white lettering). */
  logoDark?: string;
  match: RegExp;
}

/** Known banks: cards whose source name matches get the bank's logo and colors. */
const BANK_BRANDS: BankBrand[] = [
  {
    key: 'isp',
    name: 'Intesa Sanpaolo',
    logo: 'assets/banks/intesa-sanpaolo.png',
    match: /\b(isp|intesa|sanpaolo)\b/i,
  },
  {
    key: 'tirana',
    name: 'Tirana Bank',
    logo: 'assets/banks/tirana-bank.png',
    logoDark: 'assets/banks/tirana-bank-dark.png',
    match: /\btirana\s*bank\b/i,
  },
  {
    key: 'jet',
    name: 'Jet Bank',
    logo: 'assets/banks/jet-bank.svg',
    logoDark: 'assets/banks/jet-bank-dark.svg',
    match: /\bjet\s*bank\b/i,
  },
];
