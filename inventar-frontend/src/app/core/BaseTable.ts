import { HttpParams } from "@angular/common/http";
import { ViewChild } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { MatSidenav } from "@angular/material/sidenav";
import { Sort } from "@angular/material/sort";
import { Subject } from "rxjs";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "src/environments/environment";
import { DialogService } from "../services/dialog.service";
import { SharedService } from "../services/shared.service";
import { TableActionInput } from "../shared/table-actions/TableActionInput";

export abstract class BaseTable<E> {

    public constructor(public sharedService: SharedService, public dialog: DialogService) {

    }

    abstract createComponent: any;

    data: E[];
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
    abstract columns: string[];
    abstract mobileColumns: string[];

    abstract query(): void;

    openAddEditForm(entity?: E): void {
        this.dialog.openDialog(this.createComponent, entity).onSuccess(() => this.query());
    }

    paginatorEvent(event: PageEvent): void {
        this.size = event?.pageSize;
        this.page = event?.pageIndex;
        this.query();
        this.sharedService.scrollTableToTop();
    }

    onSidenavClose(): void {
        this.isSidenavOpened = false;
    }

    announceSortChange(sort: Sort): void {
        this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
        this.query();
    }

    onSearch(payload: any): void {
        this.previousFilters = payload.params;
        this.page = 0;
        this.query();
    }

    reset(): void {
        this.previousFilters = null;
        this.query();
    }

    viewDetails(id: string): void {
        this.isSidenavOpened = true;
        this.entityViewId = id;
        this.drawer.toggle();
    }

}