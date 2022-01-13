import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { HistoryService } from 'src/app/services/history.service';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';

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
  private totalRequests: number = 0;
  private defaultSort: string = "date,desc";
  private sort: string = this.defaultSort;
  public displayedColumns: string[] = ['date', 'action', 'entity', 'message', 'user', 'actions'];
  public mobileColumns: string[] = ['entity', 'message', 'user', 'actions'];
  public historyList: History[] = [];
  private historySubscription: Subscription = null;
  public tableActionInput: TableActionInput = {
    pageName: "History",
    icon: 'history',
    extra: {
      hideInsertButton: true
    }
  };

  constructor(
    public sharedService: SharedService, 
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {    
    if(this.sharedService.mobileView) {
      this.displayedColumns = this.mobileColumns;
    }
    this.query();
  }

  paginatorEvent(event: PageEvent): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
  }

  query(): void {
    this.totalRequests++;
    this.sharedService.activateLoadingSpinner();
    this.historySubscription?.unsubscribe();
    this.historySubscription = this.historyService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.historyList = res?.body.historyList;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  getHeight(difference: number): number {
    difference = this.sharedService.mobileView ? (difference - 40) : 0;
    return window.innerHeight - 275 - difference;
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
  }

  ngOnDestroy(): void {
    this.historySubscription?.unsubscribe();
  }

}
