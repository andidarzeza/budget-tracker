import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { QrScannerDialogComponent } from './qr-scanner-dialog/qr-scanner-dialog.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { Category, CategoryType, ColumnDefinition, Expense, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { HttpParams } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    BaseTableComponent,
    ExpenseDetailComponent,
    IconButtonComponent,
    PillButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent extends BaseTable<Expense> implements OnInit{

  // Field initializers need their dependencies already in scope; using
  // `inject()` directly here keeps them order-independent and avoids the
  // "used before initialization" trap with `this.*Service`.
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly breakpointService = inject(BreakpointService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly categoryService = inject(CategoriesService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly expenseService = inject(ExpenseService);
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);

  createComponent = AddExpenseComponent;
  sort: string = "createdTime,desc";
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("EXPENSE");
  filterOptions = this.filterService.select("EXPENSE");
  public tableActionInput: TableActionInput = {
    pageName: "Expenses",
    icon: 'attach_money'
  };

  /** Same breakpoint as table-card layout (≤767px) — switches the page from
   *  the dense desktop table to the mobile ledger view. */
  readonly isMobile = toSignal(this.breakpointService.useTableCardLayout$, { initialValue: false });

  /** Row data, hoisted to a signal so the date grouping below can stay reactive. */
  private readonly rows = toSignal(this.data$, { initialValue: [] as Expense[] });

  /** Total count from the API, used to decide when to stop paging on mobile
   *  (`hasMore` toggles off once we've loaded all of them). */
  private readonly totalSignal = toSignal(this.totalItems$, { initialValue: 0 });

  /** More pages available on the server? Drives the infinite-scroll sentinel. */
  readonly hasMore = computed(() => {
    const total = this.totalSignal();
    return total > 0 && this.rows().length < total;
  });

  /** Sentinel element at the bottom of the ledger; an IntersectionObserver
   *  watches it and fires `loadMore()` (inherited from `BaseTable`) when the
   *  user scrolls within ~120px of it. Re-attached whenever `hasMore` flips
   *  or the sentinel is re-rendered. */
  private readonly loadSentinel = viewChild<ElementRef<HTMLDivElement>>('loadSentinel');

  /** Category name → metadata (icon, type). Populated alongside the filter
   *  options in `ngOnInit`; we key on the joined `category` string the API
   *  returns on each expense row. */
  readonly categoriesByName = signal<Map<string, Category>>(new Map());

  /** Expenses bucketed by yyyy-mm-dd, newest day first. Each bucket carries
   *  a human label ("TODAY" / "YESTERDAY" / "MON, 12 MAR") and its items. */
  readonly groupedRows = computed(() => {
    const items = [...this.rows()].sort(
      (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
    );
    const buckets = new Map<string, { key: string; date: Date; items: Expense[] }>();
    for (const item of items) {
      const d = new Date(item.createdTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!buckets.has(key)) {
        buckets.set(key, { key, date: d, items: [] });
      }
      buckets.get(key)!.items.push(item);
    }
    return Array.from(buckets.values()).map((b) => ({
      key: b.key,
      label: this.dayLabel(b.date),
      items: b.items,
    }));
  });

  /** "This week" summary card. Multi-currency expenses can't be added across
   *  ISO codes, so we pick the dominant currency for this week (most rows)
   *  and total just that subset — a simple, defensible single-number summary. */
  readonly weekSummary = computed(() => {
    const items = this.rows();
    const monday = this.startOfWeek(new Date());
    const inWeek = items.filter((e) => new Date(e.createdTime) >= monday);
    if (inWeek.length === 0) {
      return { count: 0, total: 0, currency: '' };
    }
    const byCurrency = new Map<string, { total: number; count: number }>();
    for (const e of inWeek) {
      const c = e.currency || 'ALL';
      const bucket = byCurrency.get(c) ?? { total: 0, count: 0 };
      bucket.total += Number(e.moneySpent) || 0;
      bucket.count += 1;
      byCurrency.set(c, bucket);
    }
    // Pick the currency with the most expenses this week (tiebreak: biggest total).
    let pickCurrency = '';
    let pickCount = -1;
    let pickTotal = -1;
    for (const [code, b] of byCurrency) {
      if (b.count > pickCount || (b.count === pickCount && b.total > pickTotal)) {
        pickCurrency = code;
        pickCount = b.count;
        pickTotal = b.total;
      }
    }
    return {
      count: inWeek.length,
      total: byCurrency.get(pickCurrency)?.total ?? 0,
      currency: pickCurrency,
    };
  });

  iconFor(row: Expense & { category?: string }): string {
    const cat = this.categoriesByName().get(row.category ?? '');
    return cat?.icon || 'receipt';
  }

  /** Pastel tile background for a category's icon, keyed by category name so
   *  every row of the same category renders in the same color. */
  iconBg(name: string | null | undefined): string {
    return `color-mix(in srgb, hsl(${this.hueFor(name ?? '')}, 65%, 55%) 18%, transparent)`;
  }

  /** Solid icon color on the tile — same hue as the background, fully opaque. */
  iconFg(name: string | null | undefined): string {
    return `hsl(${this.hueFor(name ?? '')}, 55%, 45%)`;
  }

  /** Day-section header ("TODAY" / "YESTERDAY" / "MON, MAR 3" — all caps). */
  private dayLabel(date: Date): string {
    const today = this.startOfDay(new Date());
    const target = this.startOfDay(date);
    const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** Monday 00:00 of the current week (ISO week — Monday is day 1). */
  private startOfWeek(d: Date): Date {
    const start = this.startOfDay(d);
    const day = start.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const offset = (day + 6) % 7; // days since Monday
    start.setDate(start.getDate() - offset);
    return start;
  }

  /** Stable hue (0..360) derived from category name → consistent tile colors. */
  private hueFor(name: string): number {
    if (!name) return 215;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    // 7 evenly-spaced hues spanning the wheel (amber, blue, pink, violet, green, red, teal).
    const palette = [32, 215, 340, 270, 145, 8, 195];
    return palette[Math.abs(hash) % palette.length];
  }

  constructor(
    public dialog: DialogService,
    protected toaster: ToastrService,
    protected accountService: AccountService,
  ) {
    // BaseTable's constructor wires `entityService` into the `query()` /
    // `delete()` chain — pass via `inject()` so the field below stays
    // available for the QR-prefill flow.
    super(dialog, inject(ExpenseService), toaster, accountService);

    // Mobile ledger infinite scroll: observe a sentinel at the list bottom,
    // emit `loadMore()` when it enters the viewport. The effect re-attaches
    // the observer whenever the sentinel ref changes (toggled by `hasMore`)
    // and Angular auto-cleans it when the component is destroyed.
    effect((onCleanup) => {
      const el = this.loadSentinel()?.nativeElement;
      if (!el || !this.hasMore()) return;
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.loadingMore()) {
              this.loadMore();
            }
          }
        },
        { root: null, rootMargin: '120px', threshold: 0 },
      );
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });
  }

  /**
   * Mobile *create* uses a routed full-screen page (native body scroll,
   * sticky header + footer); desktop create and any edit (mobile or
   * desktop) continue to use the dialog.
   */
  override openAddEditForm(entity?: Expense): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/expenses/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.categoryService.findAll(buildParams(0, 9999).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService?.getAccount())).subscribe((res: ResponseWrapper) => {
      const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
      const index = this.filterOptions.indexOf(item);
      this.filterOptions[index].matSelectOptions = {
        options: res.data,
        displayBy: "category",
        valueBy: "id"
      };
      // The mobile ledger view looks up icons by the joined category name the
      // API returns on each expense row — build that lookup from the same
      // payload we just fetched for the filter dropdown.
      const map = new Map<string, Category>();
      for (const c of (res.data ?? []) as Category[]) {
        if (c?.category) map.set(c.category, c);
      }
      this.categoriesByName.set(map);
    });
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount());
  }

  openQrScanner(): void {
    if (!this.breakpointService.matchesMobileCreateLayout()) {
      return;
    }

    this.matDialog.open(QrScannerDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100dvh',
      maxHeight: '100dvh',
      panelClass: ['qr-scanner-dialog-panel']
    }).afterClosed().subscribe((scannedValue: string | null) => {
      if (!scannedValue) {
        return;
      }
      this.handleScannedUrl(scannedValue);
    });
  }

  private handleScannedUrl(rawValue: string): void {
    this.expenseService.verifyInvoiceFromScannedUrl(rawValue).subscribe({
      next: (response: any) => {
        const totalPrice = Number(response?.totalPrice);
        const sellerName = String(response?.seller?.name || '').trim();
        if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
          this.toaster.error(
            'Scanned invoice does not contain a valid total price.',
            'Invalid invoice',
            TOASTER_CONFIGURATION
          );
          return;
        }
        this.dialog.openDialog(AddExpenseComponent, {
          moneySpent: totalPrice,
          currency: 'ALL',
          description: sellerName
        }).onSuccess(() => this.refresh());
      },
      error: () => {
        this.toaster.error(
          'Could not verify scanned invoice. Please try again.',
          'Verification failed',
          TOASTER_CONFIGURATION
        );
      }
    });
  }

}
