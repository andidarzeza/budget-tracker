import { HttpParams } from "@angular/common/http";
import { Directive, ViewChild, signal } from "@angular/core";
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

@Directive({ standalone: false })
export abstract class BaseTable<E> extends Unsubscribe {
    private readonly minLoadingMs = 500;
    private loadingStartedAt = 0;
    private loadingTimeout: ReturnType<typeof setTimeout> | null = null;

    public constructor(
        protected dialog: DialogService,
        protected entityService: any,
        protected toaster: ToastrService,
        protected accountService: AccountService
    ) {
        super();
    }

    entityViewId: string;

    isSidenavOpened: boolean = false;

    page: number = 0;
    size: number = PAGE_SIZE;
    loadingMore = signal(false);
    loading = signal(false);

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
        if (!append) {
            this.startLoading();
        }
        this.entityService
            .findAll(this.getQueryParams())
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (res: ResponseWrapper) => {
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
        this.dialog.openDialog(this.createComponent, entity).onSuccess(() => this.resetAndQuery());
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
                this.resetAndQuery();
                this.toaster.success("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
            })
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
