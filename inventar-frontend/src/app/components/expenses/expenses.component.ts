import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Spending } from 'src/app/models/Spending';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_POSITION } from 'src/environments/environment';
import { AddSpendingComponent } from './add-spending/add-spending.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css'],
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
export class ExpensesComponent implements OnInit, OnDestroy {
  pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  page = 0;
  size = PAGE_SIZE;
  totalItems;
  totalRequests = 0;
  theme = 'light';
  sort = "createdTime,desc";
  displayedColumns: string[] = ['date', 'name', 'description', 'category', 'moneySpent', 'actions'];
  spendings: Spending[] = [];
  private deleteSubscription: Subscription = null;
  private expenseSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private spendingService: SpendingService, public dialog: MatDialog, private toaster: ToastrService) { }

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
    this.unsubscribe(this.expenseSubscription);
    this.expenseSubscription = this.spendingService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.spendings = res?.body.spendings;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openDialog(spending?: Spending): void {
    const dialogRef = this.dialog.open(AddSpendingComponent, {
      data: spending,
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


  deleteExpense(id: string): void {
    this.openConfirmDialog().afterClosed().subscribe((result: any) => {
      if(result) {
        this.delete(id);
      }
    });
  }

  openConfirmDialog(): MatDialogRef<ConfirmComponent>  {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });
    return dialogRef;
  }

  editAssociate(spending: Spending): void {
    this.openDialog(spending);
  }
  
  refresh(): void {
    this.query();
  }

  delete(id: string): void {
    this.unsubscribe(this.deleteSubscription);
    this.deleteSubscription = this.spendingService.delete(id).subscribe(() => {
      this.query();
      this.toaster.info("Element deleted successfully", "Success", {timeOut: 7000, positionClass: TOASTER_POSITION});
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
    this.unsubscribe(this.expenseSubscription);
    this.unsubscribe(this.deleteSubscription);
  }

}
