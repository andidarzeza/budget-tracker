import { HttpParams } from "@angular/common/http";
import { OnDestroy, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Sort } from "@angular/material/sort";
import { Subject } from "rxjs";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "src/environments/environment";
import { ColumnDefinition } from "../models/models";
import { DialogService } from "../services/dialog.service";
import { SharedService } from "../services/shared.service";
import { TableActionInput } from "../shared/base-table/table-actions/TableActionInput";

export abstract class BaseTable<E> implements OnDestroy {

    public constructor(
        public sharedService: SharedService, 
        public dialog: DialogService
    ) {}

    stopLoading = false;
    resetData: boolean = false;
    abstract createComponent: any;

    data: E[] = [];
    columnDefinition: ColumnDefinition[]
    entityViewId: string;
    isSidenavOpened: boolean = false;
    @ViewChild('drawer') drawer: MatSidenav;
    page: number = 0;
    size: number = PAGE_SIZE;
    pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
    totalItems: number = 0;
    _subject = new Subject();
    previousFilters: HttpParams;
    defaultSort: string = "createdTime,desc";
    sort: string = this.defaultSort;

    abstract tableActionInput: TableActionInput;

    abstract query(): void;
    abstract delete(id: string): void;

    openAddEditForm(entity?: E): void {
        this.dialog.openDialog(this.createComponent, entity).onSuccess(() => this.resetAndQuery());
    }

    onSidenavClose(): void {
        this.isSidenavOpened = false;
    }

    announceSortChange(sort: Sort): void {
        this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
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
        this.stopLoading = false;
        this.resetData = true;
        this.page = 0;
        this.query();
    }

    viewDetails(id: string): void {
        this.isSidenavOpened = true;
        this.entityViewId = id;
        this.drawer.toggle();
    }

    onScroll(): void {
        if (!this.stopLoading) {
            this.page++;
            this.query();
        }
    }

    ngOnDestroy(): void {
        this._subject.next();
        this._subject.complete();
    }

}