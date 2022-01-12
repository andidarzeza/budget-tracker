import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { filter } from 'rxjs/operators';
import { EntityOperation } from 'src/app/models/core/EntityOperation';

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
export class IncomesComponent implements OnInit, OnDestroy, EntityOperation<Income> {
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
  public tableActionInput: TableActionInput = {
    pageName: "Incomes",
    icon: 'transit_enterexit'
  };

  constructor(
    public sharedService: SharedService,
    private incomingsService: IncomingsService,
    public dialog: DialogService,
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
    this.incomeSubscription?.unsubscribe();
    this.incomeSubscription = this.incomingsService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.incomes = res?.body.incomings;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openAddEditForm(income?: Income): void {
    this.dialog.openDialog(AddIncomingComponent, income)
      .afterClosed()
      .pipe(filter((update)=>update))
      .subscribe(() => this.query());
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog.openDialog(ConfirmComponent)
      .afterClosed()
      .pipe(filter((update)=>update))
      .subscribe(() => this.delete(id));
  }
  
  delete(id: string): void {
    this.deleteSubscription?.unsubscribe();
    this.deleteSubscription = this.incomingsService.delete(id).subscribe(() => {
      this.query();
      this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
    });
  }

  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
  }

  ngOnDestroy(): void {
    this.incomeSubscription?.unsubscribe();
    this.deleteSubscription?.unsubscribe();
  }
}
