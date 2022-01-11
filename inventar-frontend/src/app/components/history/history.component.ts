import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/environments/environment';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { HistoryService } from 'src/app/services/history.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class HistoryComponent implements OnInit {

  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  private totalRequests: number = 0;
  private defaultSort: string = "date,desc";
  private sort: string = this.defaultSort;
  public displayedColumns: string[] = ['date', 'action', 'entity', 'message', 'user', 'actions'];
  public historyList: History[] = [];
  private historySubscription: Subscription = null;

  public tableActionInput: TableActionInput = {
    pageName: "History",
    icon: 'history',
    extra: {
      hideInsertButton: true
    }
  };

  constructor(public sharedService: SharedService, private historyService: HistoryService, public dialog: MatDialog) { }

  ngOnInit(): void {
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
    this.unsubscribe(this.historySubscription);
    this.historySubscription = this.historyService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.historyList = res?.body.historyList;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openConfirmDialog(): MatDialogRef<ConfirmComponent>  {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });
    return dialogRef;
  }
  
  refresh(): void {
    this.query();
  }


  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }

  private unsubscribe(subscription: Subscription): void {
    if(subscription) {
      subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe(this.historySubscription);
  }

  announceSortChange(sort: Sort): void {
    if(sort.direction) {
      this.sort = `${sort.active},${sort.direction}`;
    } else {
      this.sort = this.defaultSort;
    }
    this.query();
  }

}
