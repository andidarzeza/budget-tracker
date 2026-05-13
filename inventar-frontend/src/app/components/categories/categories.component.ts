import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { Category, CategoryType, ColumnDefinition } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { buildParams } from 'src/app/utils/param-bulder';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';

interface CategorySummary {
  total: number;
  expense: number;
  income: number;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    BaseTableComponent,
    CategoryDetailComponent,
    IconButtonComponent,
    PillButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class CategoriesComponent extends BaseTable<Category> implements OnInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly breakpointService = inject(BreakpointService);
  private readonly router = inject(Router);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  sort: string = 'lastModifiedDate,desc';

  createComponent = AddCategoryComponent;
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('CATEGORY');
  filterOptions = this.filterService.select('CATEGORY');

  tableActionInput: TableActionInput = {
    pageName: 'Categories',
    icon: 'list_alt',
  };
  resetData: boolean = false;

  /** Same breakpoint as table-card layout (≤767px) — switches the page from
   *  the dense desktop table to the mobile ledger view. */
  readonly isMobile = toSignal(this.breakpointService.useTableCardLayout$, { initialValue: false });

  /** Row data, hoisted to a signal so the type grouping below stays reactive. */
  private readonly rows = toSignal(this.data$, { initialValue: [] as Category[] });

  /** Total count from the API — drives `hasMore`. */
  private readonly totalSignal = toSignal(this.totalItems$, { initialValue: 0 });

  /** More pages available on the server? Drives the infinite-scroll sentinel. */
  readonly hasMore = computed(() => {
    const total = this.totalSignal();
    return total > 0 && this.rows().length < total;
  });

  /** Sentinel at the bottom of the ledger; an IntersectionObserver watches it
   *  and fires `loadMore()` when the user scrolls within ~120px of it. */
  private readonly loadSentinel = viewChild<ElementRef<HTMLDivElement>>('loadSentinel');

  /** Categories grouped by type — Expense first, then Income — instead of by
   *  day (categories aren't transactional). Empty buckets are dropped so a
   *  type header doesn't appear when the user hasn't created any of them. */
  readonly groupedRows = computed(() => {
    const items = this.rows();
    const expense = items.filter((c) => c.categoryType === CategoryType.EXPENSE);
    const income = items.filter((c) => c.categoryType === CategoryType.INCOME);
    const groups: { key: string; label: string; items: Category[] }[] = [];
    if (expense.length > 0) groups.push({ key: 'EXPENSE', label: 'EXPENSE', items: expense });
    if (income.length > 0) groups.push({ key: 'INCOME', label: 'INCOME', items: income });
    return groups;
  });

  /** Top summary card — replaces "this week" with a static category census so
   *  users can see at a glance how their taxonomy is balanced. */
  readonly summary = computed<CategorySummary>(() => {
    const items = this.rows();
    return {
      total: items.length,
      expense: items.filter((c) => c.categoryType === CategoryType.EXPENSE).length,
      income: items.filter((c) => c.categoryType === CategoryType.INCOME).length,
    };
  });

  iconFor(row: Category): string {
    return row?.icon || 'label';
  }

  iconBg(name: string | null | undefined): string {
    return `color-mix(in srgb, hsl(${this.hueFor(name ?? '')}, 65%, 55%) 18%, transparent)`;
  }

  iconFg(name: string | null | undefined): string {
    return `hsl(${this.hueFor(name ?? '')}, 55%, 45%)`;
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
    super(inject(DialogService), inject(CategoriesService), inject(ToastrService), inject(AccountService));

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

  override openAddEditForm(entity?: Category): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/categories/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }
}
