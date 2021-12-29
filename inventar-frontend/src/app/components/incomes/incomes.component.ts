import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Income } from 'src/app/models/Income';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddIncomingComponent } from './add-incoming/add-incoming.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css'],
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
export class IncomesComponent implements OnInit, OnDestroy {
  public incomes: Income[] = [];
  public totalItems: number = 0;
  private totalRequests: number = 0;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  private page: number = 0;
  public size: number = PAGE_SIZE;
  private defaultSort: string = "createdTime,desc";
  private sort: string = this.defaultSort;
  public displayedColumns: string[] = ['date', 'name', 'description', 'category', 'incoming', 'actions'];
  private deleteSubscription: Subscription = null;
  private incomeSubscription: Subscription = null;

  constructor(
    public sharedService: SharedService,
    private incomingsService: IncomingsService,
    public dialog: MatDialog,
    private toaster: ToastrService
  ) {}

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
    this.unsubscribe(this.incomeSubscription);
    this.incomeSubscription = this.incomingsService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.incomes = res?.body.incomings;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openDialog(income?: Income): void {
    const dialogRef = this.dialog.open(AddIncomingComponent, {
      data: income,
      width: '700px',
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });

    dialogRef.afterClosed().subscribe((update: boolean) => {
      if(update) {
        this.query();
      }
    });
  }

  deleteIncome(id: string): void {
    this.openConfirmDialog().afterClosed().subscribe((result: any) => {
      if(result) {
        this.delete(id);
      }
    });;
  }

  openConfirmDialog(): MatDialogRef<ConfirmComponent>  {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });
    return dialogRef;
  }

  edit(income: Income): void {
    this.openDialog(income);
  }
  
  refreshData(): void {
    this.query();
  }

  openDeleteOption(id: string): void {
    const del = document.getElementById(`${id}-delete`) as HTMLElement;
    const icn = document.getElementById(`${id}-icon`) as HTMLElement;
    const icn_cnt = document.getElementById(`${id}-icon-cnt`) as HTMLElement;
    if(del &&icn_cnt &&icn) {
      del.style.width = '39.4px';
      del.style.padding = '10px';
      icn.style.width = '0';
      icn_cnt.style.paddingLeft = '0';
      icn_cnt.style.paddingRight = '0';
    }
  }

  delete(id: string): void {
    this.unsubscribe(this.deleteSubscription);
    this.deleteSubscription = this.incomingsService.delete(id).subscribe(() => {
      this.query();
      this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
    });
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
    this.unsubscribe(this.incomeSubscription);
    this.unsubscribe(this.deleteSubscription);
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
