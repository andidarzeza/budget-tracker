import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Expense } from 'src/app/models/Expense';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddSpendingComponent } from './add-spending/add-spending.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { EntityOperation } from 'src/app/models/core/EntityOperation';
import { filter } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, OnDestroy, EntityOperation<Expense> {
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  public defaultSort: string = "createdTime,desc";
  public sort: string = this.defaultSort;
  public displayedColumns: string[] = ['createdTime', 'name', 'description', 'category', 'moneySpent', 'actions'];
  public mobileColumns: string[] = ['name', 'category', 'moneySpent', 'actions'];
  public expenses: Expense[] = [];
  private deleteSubscription: Subscription = null;
  private expenseSubscription: Subscription = null;
  public tableActionInput: TableActionInput = {
    pageName: "Expenses",
    icon: 'attach_money'
  };

  constructor(
    public sharedService: SharedService,
    private spendingService: SpendingService,
    public dialog: DialogService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = this.sharedService.mobileView ? this.mobileColumns : this.displayedColumns;
    this.query();
  }

  paginatorEvent(event: PageEvent): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.expenseSubscription?.unsubscribe();
    this.expenseSubscription = this.spendingService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.expenses = res?.body.spendings;
      this.totalItems = res?.body.count;
      this.sharedService.checkLoadingSpinner();     
    });
  }

  openAddEditForm(expense?: Expense): void {
    this.dialog.openDialog(AddSpendingComponent, expense)
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
    this.sharedService.activateLoadingSpinner();
    this.deleteSubscription?.unsubscribe();
    this.deleteSubscription = this.spendingService.delete(id).subscribe(() => {
      this.sharedService.checkLoadingSpinner();
      this.query();
      this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
    });
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort; 
    this.query();
  }

  ngOnDestroy(): void {
    this.expenseSubscription?.unsubscribe();
    this.deleteSubscription?.unsubscribe();
  }
}
