import { HttpParams } from "@angular/common/http";
import { ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Sort } from "@angular/material/sort";
import { PAGE_SIZE, TOASTER_CONFIGURATION } from "src/environments/environment";
import { ColumnDefinition, ResponseWrapper } from "../models/models";
import { DialogService } from "../services/dialog.service";
import { TableActionInput } from "../shared/base-table/table-actions/TableActionInput";
import { map, shareReplay, takeUntil } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { AccountService } from "../services/account.service";
import { Unsubscribe } from "../shared/unsubscribe";
import { Observable } from "rxjs";

export abstract class BaseTable<E> extends Unsubscribe {
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
    totalItems$: Observable<number>;
    data$: Observable<E[]>;
    columnDefinition: ColumnDefinition[];
    @ViewChild('drawer') drawer: MatSidenav;
    previousFilters: HttpParams;
    abstract sort: string;

    abstract createComponent: any;
    abstract tableActionInput: TableActionInput;
    abstract getQueryParams(): HttpParams;

    query(): void {
        const response = this.entityService.findAll(this.getQueryParams()).pipe(shareReplay());
        this.data$ = response.pipe(map((response: ResponseWrapper) => response.data));
        this.totalItems$ = response.pipe(map((response: ResponseWrapper) => response.count));
    }

    onNextPage(page: number): void {
        this.page = page;
        this.query();
    }

    openAddEditForm(entity?: E): void {
        this.dialog.openDialog(this.createComponent, entity).onSuccess(() => this.resetAndQuery());
    }

    onSidenavClose(): void {
        this.isSidenavOpened = false;
    }

    announceSortChange(sort: Sort): void {
        this.query();
    }

    openDeleteConfirmDialog(id: string): void {
        this.dialog.openConfirmDialog().onSuccess(() => this.delete(id));
    }

    onSearch(payload: any): void {
        this.previousFilters = payload.params;
        this.page = 0;
        this.query();
    }

    resetAndQuery(): void {
        this.previousFilters = null;
        this.page = 0;
        this.query();
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
                this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
            })
    }

}