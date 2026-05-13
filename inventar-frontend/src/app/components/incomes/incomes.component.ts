import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { Category, ColumnDefinition, Income, ResponseWrapper } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { buildParams } from 'src/app/utils/param-bulder';
import { AddIncomeComponent } from './add-income/add-income.component';
import { IncomeDetailsComponent } from './income-details/income-details.component';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    BaseTableComponent,
    IncomeDetailsComponent,
    IconButtonComponent,
    PillButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class IncomesComponent extends BaseTable<Income> implements OnInit, AfterViewInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly breakpointService = inject(BreakpointService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly categoryService = inject(CategoriesService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  sort: string = 'createdTime,desc';

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('INCOME');
  filterOptions = this.filterService.select('INCOME');

  createComponent = AddIncomeComponent;
  tableActionInput: TableActionInput = {
    pageName: 'Incomes',
    icon: 'transit_enterexit',
  };

  /** Same breakpoint as table-card layout (≤767px) — switches the page from
   *  the dense desktop table to the mobile ledger view. */
  readonly isMobile = toSignal(this.breakpointService.useTableCardLayout$, { initialValue: false });

  /** Row data, hoisted to a signal so the date grouping below can stay reactive. */
  private readonly rows = toSignal(this.data$, { initialValue: [] as Income[] });

  /** Total count from the API, used to decide when to stop paging on mobile. */
  private readonly totalSignal = toSignal(this.totalItems$, { initialValue: 0 });

  /** More pages available on the server? Drives the infinite-scroll sentinel. */
  readonly hasMore = computed(() => {
    const total = this.totalSignal();
    return total > 0 && this.rows().length < total;
  });

  /** Sentinel at the bottom of the ledger; an IntersectionObserver watches it
   *  and fires `loadMore()` when the user scrolls within ~120px of it. */
  private readonly loadSentinel = viewChild<ElementRef<HTMLDivElement>>('loadSentinel');

  /** Category name → metadata (icon). Populated from the same fetch that
   *  powers the filter dropdown so the mobile rows can show category icons. */
  readonly categoriesByName = signal<Map<string, Category>>(new Map());

  /** Income groups by day, newest first. */
  readonly groupedRows = computed(() => {
    const items = [...this.rows()].sort(
      (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
    );
    const buckets = new Map<string, { key: string; date: Date; items: Income[] }>();
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

  /** "This week" summary card — same currency-picking heuristic the expenses
   *  page uses: sum the dominant-currency rows within the current ISO week. */
  readonly weekSummary = computed(() => {
    const items = this.rows() as (Income & { currency?: string })[];
    const monday = this.startOfWeek(new Date());
    const inWeek = items.filter((e) => new Date(e.createdTime) >= monday);
    if (inWeek.length === 0) {
      return { count: 0, total: 0, currency: '' };
    }
    const byCurrency = new Map<string, { total: number; count: number }>();
    for (const e of inWeek) {
      const c = e.currency || 'ALL';
      const bucket = byCurrency.get(c) ?? { total: 0, count: 0 };
      bucket.total += Number(e.incoming) || 0;
      bucket.count += 1;
      byCurrency.set(c, bucket);
    }
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

  iconFor(row: Income & { category?: string }): string {
    const cat = this.categoriesByName().get(row.category ?? '');
    return cat?.icon || 'trending_up';
  }

  iconBg(name: string | null | undefined): string {
    return `color-mix(in srgb, hsl(${this.hueFor(name ?? '')}, 65%, 55%) 18%, transparent)`;
  }

  iconFg(name: string | null | undefined): string {
    return `hsl(${this.hueFor(name ?? '')}, 55%, 45%)`;
  }

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

  private startOfWeek(d: Date): Date {
    const start = this.startOfDay(d);
    const day = start.getDay();
    const offset = (day + 6) % 7;
    start.setDate(start.getDate() - offset);
    return start;
  }

  private hueFor(name: string): number {
    if (!name) return 215;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    const palette = [32, 215, 340, 270, 145, 8, 195];
    return palette[Math.abs(hash) % palette.length];
  }

  constructor() {
    super(inject(DialogService), inject(IncomeService), inject(ToastrService), inject(AccountService));

    // Mobile infinite-scroll: observe a sentinel at the list bottom and emit
    // `loadMore()` when it enters the viewport. Auto-disconnects on destroy.
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
  override openAddEditForm(entity?: Income): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/incomes/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.getCategories();
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }

  private getCategories(): void {
    this.categoryService
      .incomeCategories(buildParams(0, 9999).append('account', this.accountService?.getAccount()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: ResponseWrapper) => {
        const item = this.filterOptions.filter((filterOpt) => filterOpt.field == 'category')[0];
        item.matSelectOptions = {
          options: res.data,
          displayBy: 'category',
          valueBy: 'id',
        };
        // Build a category-name → metadata map so mobile rows can show icons.
        const map = new Map<string, Category>();
        for (const c of (res.data ?? []) as Category[]) {
          if (c?.category) map.set(c.category, c);
        }
        this.categoriesByName.set(map);
      });
  }
}
