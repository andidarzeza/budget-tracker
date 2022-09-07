import { HttpParams } from "@angular/common/http";
import { AfterViewInit, OnDestroy, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Sort } from "@angular/material/sort";
import { Subject } from "rxjs";
import { PAGE_SIZE } from "src/environments/environment";
import { ColumnDefinition, ResponseWrapper } from "../models/models";
import { DialogService } from "../services/dialog.service";
import { SharedService } from "../services/shared.service";
import { TableActionInput } from "../shared/base-table/table-actions/TableActionInput";
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseTable<E> implements OnDestroy, AfterViewInit {

    public constructor(
        public sharedService: SharedService,
        public dialog: DialogService
    ) { }

    tableId: string = uuidv4();
    entityViewId: string;
    
    stopLoading: boolean = false;
    resetData: boolean = false;
    isSidenavOpened: boolean = false;

    page: number = 0;
    currentIndex: number = 0;
    size: number = PAGE_SIZE;
    totalItems: number = 0;

    data: E[] = [];
    displayData: E[] = [];
    columnDefinition: ColumnDefinition[];
    
    
    @ViewChild('drawer') drawer: MatSidenav;
    
    
    
    subject = new Subject();
    previousFilters: HttpParams;
    defaultSort: string = "createdTime,desc";
    sort: string = this.defaultSort;
    private scrollElement: any;

    abstract createComponent: any;
    abstract tableActionInput: TableActionInput;
    abstract query(): void;
    abstract delete(id: string): void;

    ngAfterViewInit(): void {
        this.scrollElement = document.getElementById(this.tableId);
    }

    onQuerySuccess(response: ResponseWrapper): void {
        this.data = this.resetData ? response.data : this.data.concat(response?.data);
        if(this.resetData) {
            this.displayData = response?.data;
        } else {
            if (this.displayData.length >= 100) {
                this.displayData.splice(0, this.size);
                this.currentIndex++;
                this.displayData = this.displayData.concat(response.data);
                
                const num = this.scrollElement.clientHeight;
                const result = (num * 5) + 200;
                this.scrollElement.scrollTo({ top: result });
            } else {
                this.displayData = this.displayData.concat(response.data);
            }
        }
        
        this.stopLoading = response.data.length < this.size;
        this.resetData = false;
        this.totalItems = response?.count;
    }

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
        this.resetData = true;
        this.previousFilters = payload.params;
        this.page = 0;
        this.query();
    }

    resetAndQuery(): void {
        this.previousFilters = null;
        this.stopLoading = false;
        this.resetData = true;
        this.page = 0;
        this.currentIndex = 0;
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

    onTopScroll(): void {
        if (this.currentIndex != 0) {
            const resu: E[] = this.data.slice((this.currentIndex - 1) * this.size, this.currentIndex * this.size);
            this.currentIndex--;
            this.displayData.splice(this.displayData.length - this.size, this.size);
            this.displayData = resu.concat(this.displayData);                   
            this.scrollElement.scrollTo({ top: 300 });
        }
    }

    ngOnDestroy(): void {
        this.subject.next();
        this.subject.complete();
    }

}