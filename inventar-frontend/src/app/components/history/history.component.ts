import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { HistoryService } from 'src/app/services/history.service';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { MatSidenav } from '@angular/material/sidenav';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { takeUntil } from 'rxjs/operators';
import { ENTITIES, EntityAction, EntityType, ENTITY_ACTIONS } from 'src/app/models/models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {

  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  private defaultSort: string = "date,desc";
  private sort: string = this.defaultSort;
  public displayedColumns: string[] = ['date', 'action', 'entity', 'message', 'user', 'actions'];
  public mobileColumns: string[] = ['entity', 'message', 'user', 'actions'];
  public historyList: History[] = [];
  public historyId: string;
  isSidenavOpened: boolean = false;
  @ViewChild('drawer') drawer: MatSidenav;
  private _subject = new Subject();
  private previousFilters: HttpParams;
  public tableActionInput: TableActionInput = {
    pageName: "History",
    icon: 'history',
    extra: {
      hideInsertButton: true
    }
  };

  filterOptions: FilterOptions[] = [
    {
      field: "action",
      label: "Action",
      type: "select",
      matSelectOptions: this.getActions()
    },
    {
      field: "entity",
      label: "Entity",
      type: "select",
      matSelectOptions: this.getEntities()
    },
    {
      field: "message",
      label: "Message",
      type: "text"
    }
  ];

  constructor(
    public sharedService: SharedService,
    private historyService: HistoryService
  ) { }

  ngOnInit(): void {
    this.displayedColumns = this.sharedService.mobileView ? this.mobileColumns : this.displayedColumns;
    this.query();
  }

  private getActions() {
    return {
      options: ENTITY_ACTIONS.map((action: EntityAction) => {
        return {
          display: action.toUpperCase(),
          value: action.toUpperCase()
        }
      }),
      displayBy: "display",
      valueBy: "value"
    }
  }

  private getEntities() {
    return {
      options: ENTITIES.map((action: EntityType) => {
        return {
          display: action.toUpperCase(),
          value: action.toUpperCase()
        }
      }),
      displayBy: "display",
      valueBy: "value"
    }
  }

  paginatorEvent(event: PageEvent): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
    this.sharedService.scrollTableToTop();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.historyService
      .findAll(this.page, this.size, this.sort, this.previousFilters)
      .pipe(takeUntil(this._subject))
      .subscribe((res: HttpResponse<any>) => {
        this.historyList = res?.body.historyList;
        this.totalItems = res?.body.count;
        this.sharedService.checkLoadingSpinner();
      },
        () => {
          this.sharedService.checkLoadingSpinner();
        });
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

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  viewHistoryDetails(id: string): void {
    this.historyId = id;
    this.isSidenavOpened = true;
    this.drawer.toggle();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

}
