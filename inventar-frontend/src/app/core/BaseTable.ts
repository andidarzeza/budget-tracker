import { HttpParams } from "@angular/common/http";
import { Directive, ViewChild, inject, signal } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable } from "rxjs";
import { PAGE_SIZE, TOASTER_CONFIGURATION } from "src/environments/environment";
import { ColumnDefinition, ResponseWrapper } from "../models/models";
import { DialogService } from "../services/dialog.service";
import { TableActionInput } from "../shared/base-table/table-actions/TableActionInput";
import { takeUntil } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { AccountService } from "../services/account.service";
import { Unsubscribe } from "../shared/unsubscribe";
import { ListCacheService, sameResponse } from "./services/list-cache.service";

@Directive({ standalone: false })
export abstract class BaseTable<E> extends Unsubscribe {
    private readonly minLoadingMs = 500;
    private loadingStartedAt = 0;
    private loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    protected readonly listCache = inject(ListCacheService);
    /** Only the page's first load may show the cached copy; refreshes after
     *  a delete or a filter change always wait for the server. */
    private firstQuery = true;

    public constructor(
        protected dialog: DialogService,
        protected entityService: any,
        protected toaster: ToastrService,
        protected accountService: AccountService
    ) {
        super();
        // The background refresh found newer data for the list on screen:
        // swap it in, but only on the plain first page (no filters, nothing
        // appended by scrolling) and not mid-load.
        this.listCache.updated$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((key) => {
                if (key !== this.cacheKey(false) || this.loading() || this.loadingMore()) return;
                const fresh = this.listCache.get(key);
                if (fresh) this.applyFirstPage(fresh);
            });
    }

    entityViewId: string;

    isSidenavOpened: boolean = false;

    page: number = 0;
    size: number = PAGE_SIZE;
    loadingMore = signal(false);
    /** True from the start: every list queries on init, so until the first
     *  response arrives the page must not show its "no data" state. */
    loading = signal(true);

    private dataSubject = new BehaviorSubject<E[]>([]);
    private totalSubject = new BehaviorSubject<number>(0);

    data$: Observable<E[]> = this.dataSubject.asObservable();
    totalItems$: Observable<number> = this.totalSubject.asObservable();

    columnDefinition: ColumnDefinition[];
    @ViewChild('drawer') drawer: MatSidenav;
    previousFilters: HttpParams;
    abstract sort: string;

    abstract createComponent: any;
    abstract tableActionInput: TableActionInput;
    abstract getQueryParams(): HttpParams;

    query(append: boolean = false): void {
        const key = this.cacheKey(append);
        const cached = key && this.firstQuery ? this.listCache.get(key) : null;
        this.firstQuery = false;
        if (cached) {
            // Show the prefetched first page at once; the request below
            // then quietly replaces it if anything changed.
            this.applyFirstPage(cached);
            this.cancelLoading();
        } else if (!append) {
            this.startLoading();
        }
        this.entityService
            .findAll(this.getQueryParams())
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (res: ResponseWrapper) => {
                    if (key) this.listCache.put(key, res);
                    if (cached) {
                        // Skip if the user already scrolled more pages in.
                        if (this.page === 0) this.applyFirstPage(res);
                        return;
                    }
                    const rows = res?.data ?? [];
                    const total = res?.count ?? 0;
                    if (append) {
                        if (rows.length === 0) {
                            this.page = Math.max(0, this.page - 1);
                            this.loadingMore.set(false);
                            return;
                        }
                        this.dataSubject.next([...this.dataSubject.getValue(), ...rows]);
                    } else {
                        this.dataSubject.next([...rows]);
                    }
                    this.totalSubject.next(total);
                    if (!append) {
                        this.stopLoading();
                    }
                    this.loadingMore.set(false);
                },
                error: () => {
                    if (append) {
                        this.page = Math.max(0, this.page - 1);
                    }
                    if (!append) {
                        this.stopLoading();
                    }
                    this.loadingMore.set(false);
                }
            });
    }

    /** Desktop paginator: jump to page (replaces list). */
    onNextPage(page: number): void {
        this.page = page;
        this.query(false);
    }

    /** Mobile infinite scroll: next page appended. */
    loadMore(): void {
        const loaded = this.dataSubject.getValue().length;
        const total = this.totalSubject.getValue();
        if (this.loadingMore() || total === 0 || loaded >= total) {
            return;
        }
        this.loadingMore.set(true);
        this.page++;
        this.query(true);
    }

    openAddEditForm(entity?: E): void {
        // After save, re-query keeping the active filters so the user's view
        // doesn't suddenly widen to "all records" — they can still see the
        // newly-inserted/edited item if it matches the current filter, or
        // get a clean empty result if it doesn't.
        this.dialog.openDialog(this.createComponent, entity).onSuccess(() => this.refresh());
    }

    onSidenavClose(): void {
        this.isSidenavOpened = false;
    }

    announceSortChange(sort: Sort): void {
        this.page = 0;
        this.query(false);
    }

    openDeleteConfirmDialog(id: string): void {
        this.dialog.openConfirmDialog().onSuccess(() => this.delete(id));
    }

    onSearch(payload: {params: HttpParams}): void {        
        this.previousFilters = payload.params;
        this.page = 0;
        this.query(false);
    }

    /**
     * Re-query from page 0 keeping the currently-applied filters. Used by
     * the toolbar's refresh button, layout switches, and after insert /
     * delete — anything that wants a fresh result set without throwing
     * away the user's filter selection.
     */
    refresh(): void {
        this.page = 0;
        this.query(false);
    }

    /**
     * Wipe the active filters *and* re-query. Wired to the filter panel's
     * explicit "Reset" button — never call this from refresh/insert/delete
     * paths, since those should preserve filters.
     */
    resetAndQuery(): void {
        this.previousFilters = null;
        this.page = 0;
        this.query(false);
    }

    viewDetails(id: string): void {
        this.isSidenavOpened = true;
        this.entityViewId = id;
        this.drawer.toggle();
    }

    delete(id: string): void {
        this.entityService
            .delete(id)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.accountService.findOne(this.accountService.getAccount()).subscribe();
                this.refresh();
                this.toaster.success("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
            })
    }

    /** Cache key for the request about to be made — only for the plain
     *  first page (page 0, no filters), the one that is prefetched. */
    private cacheKey(append: boolean): string | null {
        if (append || this.page !== 0 || this.previousFilters || !this.entityService?.API_URl) return null;
        return ListCacheService.key(this.entityService.API_URl, this.getQueryParams());
    }

    /** Replace the rows with a first-page response, skipping no-op updates. */
    private applyFirstPage(res: ResponseWrapper): void {
        const current: ResponseWrapper = { data: this.dataSubject.getValue(), count: this.totalSubject.getValue() };
        if (sameResponse(current, { data: res?.data ?? [], count: res?.count ?? 0 })) return;
        this.page = 0;
        this.dataSubject.next([...(res?.data ?? [])]);
        this.totalSubject.next(res?.count ?? 0);
    }

    private cancelLoading(): void {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        this.loading.set(false);
    }

    private startLoading(): void {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        this.loadingStartedAt = Date.now();
        this.loading.set(true);
    }

    private stopLoading(): void {
        const elapsed = Date.now() - this.loadingStartedAt;
        const remaining = Math.max(0, this.minLoadingMs - elapsed);
        this.loadingTimeout = setTimeout(() => {
            this.loading.set(false);
            this.loadingTimeout = null;
        }, remaining);
    }

}
