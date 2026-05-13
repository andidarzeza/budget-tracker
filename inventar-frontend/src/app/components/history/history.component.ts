import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { ColumnDefinition, EntityAction, History } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { HistoryService } from 'src/app/services/pages/history.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { buildParams } from 'src/app/utils/param-bulder';
import { HistoryDetailsComponent } from './history-details/history-details.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    BaseTableComponent,
    HistoryDetailsComponent,
    IconButtonComponent,
    PillButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class HistoryComponent extends BaseTable<History> implements OnInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly breakpointService = inject(BreakpointService);
  private readonly historyService = inject(HistoryService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  sort: string = 'date,desc';
  createComponent: any;

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('HISTORY');

  tableActionInput: TableActionInput = {
    pageName: 'History',
    icon: 'history',
    extra: {
      hideInsertButton: true,
    },
  };

  filterOptions = this.filterService.select('HISTORY');

  /** Same breakpoint as table-card layout (≤767px) — switches the page from
   *  the dense desktop table to the mobile ledger view. */
  readonly isMobile = toSignal(this.breakpointService.useTableCardLayout$, { initialValue: false });

  /** Row data, hoisted to a signal so the date grouping below stays reactive. */
  private readonly rows = toSignal(this.data$, { initialValue: [] as History[] });

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

  /** History entries grouped by day, newest day first. */
  readonly groupedRows = computed(() => {
    const items = [...this.rows()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const buckets = new Map<string, { key: string; date: Date; items: History[] }>();
    for (const item of items) {
      const d = new Date(item.date);
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

  /** Material icon name keyed off the action — gives the row a quick visual cue. */
  iconFor(row: History): string {
    switch (row?.action) {
      case EntityAction.CREATE: return 'add_circle';
      case EntityAction.UPDATE: return 'edit';
      case EntityAction.DELETE: return 'delete_outline';
      case EntityAction.AUTHENTICATION: return 'login';
      case EntityAction.REGISTRATION: return 'person_add';
      case EntityAction.EXPORT: return 'download';
      default: return 'history';
    }
  }

  /** Tile background — same color-mix recipe as the other ledgers but keyed
   *  off the action so the colors carry semantic weight (create = green,
   *  delete = red, …) instead of being incidental. */
  iconBg(row: History): string {
    return `color-mix(in srgb, hsl(${this.hueFor(row)}, 65%, 55%) 18%, transparent)`;
  }

  iconFg(row: History): string {
    return `hsl(${this.hueFor(row)}, 55%, 45%)`;
  }

  /** Human-readable row title: "Created Expense", "Logged in", etc. */
  titleFor(row: History): string {
    const entity = this.titleCase(row?.entity ?? '');
    switch (row?.action) {
      case EntityAction.CREATE: return `Created ${entity}`;
      case EntityAction.UPDATE: return `Updated ${entity}`;
      case EntityAction.DELETE: return `Deleted ${entity}`;
      case EntityAction.AUTHENTICATION: return 'Logged in';
      case EntityAction.REGISTRATION: return 'Registered account';
      case EntityAction.EXPORT: return `Exported ${entity}`;
      default: return this.titleCase(row?.action ?? '') || 'Event';
    }
  }

  private titleCase(s: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  private hueFor(row: History): number {
    // Stable semantic hues per action — matches the visual vocabulary used
    // elsewhere (red for destructive, green for create, etc.).
    switch (row?.action) {
      case EntityAction.CREATE: return 145;         // green
      case EntityAction.UPDATE: return 215;         // blue
      case EntityAction.DELETE: return 8;           // red
      case EntityAction.AUTHENTICATION: return 270; // violet
      case EntityAction.REGISTRATION: return 195;   // teal
      case EntityAction.EXPORT: return 32;          // amber
      default: return 215;
    }
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

  constructor() {
    super(inject(DialogService), inject(HistoryService), inject(ToastrService), inject(AccountService));

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

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }
}
