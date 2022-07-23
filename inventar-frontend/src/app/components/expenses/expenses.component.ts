import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Expense } from 'src/app/models/Expense';
import { SharedService } from 'src/app/services/shared.service';
import { SpendingService } from 'src/app/services/spending.service';
import { environment, PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { EntityOperation } from 'src/app/models/core/EntityOperation';
import { filter, takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, OnDestroy, EntityOperation<Expense> {
  @ViewChild('drawer') drawer: MatSidenav;
  isSidenavOpened: boolean = false;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  public defaultSort: string = "createdTime,desc";
  public sort: string = this.defaultSort;
  public displayedColumns: string[] = ['createdTime', 'name', 'description', 'category', 'moneySpent', 'actions'];
  public mobileColumns: string[] = ['name', 'category', 'moneySpent', 'actions'];
  public expenses: Expense[] = [];

  public expenseViewId = "";
  public tableActionInput: TableActionInput = {
    pageName: "Expenses",
    icon: 'attach_money'
  };

  private _subject = new Subject();

  public EXPERIMENTAL_MODE = environment.experimentalMode;

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
    this.sharedService.scrollTableToTop();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.spendingService
      .findAll(this.page, this.size, this.sort)
      .pipe(takeUntil(this._subject))
      .subscribe((res: HttpResponse<any>) => {
        this.expenses = res?.body.expenses;
        this.totalItems = res?.body.count;
        this.sharedService.checkLoadingSpinner();     
      },
      () => {
        this.sharedService.checkLoadingSpinner();
      });
  }

  openAddEditForm(expense?: Expense): void {
    this.dialog.openDialog(AddExpenseComponent, expense)
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.query());
  }

  onMouseEnter(temp: any): void {
    console.log(temp);
    
  }

  viewExpenseDetails(id: string): void {
    this.isSidenavOpened = true;
    this.expenseViewId = id;
    this.drawer.toggle();
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog.openConfirmDialog(ConfirmComponent)
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.delete(id));
  }

  delete(id: string): void {
    this.sharedService.activateLoadingSpinner();
    this.spendingService
      .delete(id)
      .pipe(takeUntil(this._subject)) 
      .subscribe(() => {
        this.sharedService.checkLoadingSpinner();
        this.query();
        this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
      },
      () => {
        this.sharedService.checkLoadingSpinner();
      });
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort; 
    this.query();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

  public getExpenseDate(date: any): string {    
    const now = new Date();
    if(now.getTime() - new Date(date).getTime() < 24 * 60 * 60 * 1000) {
      return 'a day ago';
    }
    return date.getTime(date).toString();
  }
}
