import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { MatSidenav } from '@angular/material/sidenav';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { takeUntil } from 'rxjs/operators';
import { ColumnDefinition, ENTITIES, EntityAction, EntityType, ENTITY_ACTIONS, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';

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

  columnDefinition: ColumnDefinition[] = [
    {
      column: 'date',
      type: 'date'
    },
    {
      column: 'action',
      type: 'string'
    },
    {
      column: 'entity',
      type: 'string'
    },
    {
      column: 'message',
      type: 'string'
    },
    {
      column: 'user',
      type: 'string'
    },
    {
      column: 'actions',
      type: 'actions'
    }
  ];

  public data: History[] = [];
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
  resetData: boolean = false;

  constructor(
    public sharedService: SharedService,
    private historyService: HistoryService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  onScroll(): void {
    this.page++;
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

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.historyService
      .findAll(buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this._subject))
      .subscribe((res: ResponseWrapper) => {
        this.data = this.resetData ? res?.data : this.data.concat(res?.data);
        this.resetData = false;
        this.totalItems = res?.count;
        this.sharedService.checkLoadingSpinner();
      },
        () => {
          this.sharedService.checkLoadingSpinner();
        });
  }

  onSearch(payload: any): void {
    this.previousFilters = payload.params;
    this.resetAndQuery();
  }

  reset(): void {
    this.previousFilters = null;
    this.resetAndQuery();
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  viewDetails(id: string): void {
    this.historyId = id;
    this.isSidenavOpened = true;
    this.drawer.toggle();
  }

  resetAndQuery(): void {
    this.sharedService.scrollTableToTop();
    this.resetData = true;
    this.page = 0;
    this.query();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

}
