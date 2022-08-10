import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { CURRENCIES, environment, PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
import { MatSidenav } from '@angular/material/sidenav';
import { CategoryType, Expense, ResponseWrapper } from 'src/app/models/models';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { EntityOperation } from 'src/app/core/EntityOperation';

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
  public displayedColumns: string[] = ['createdTime', 'category', 'description', 'moneySpent', 'actions'];
  public mobileColumns: string[] = ['category', 'moneySpent', 'actions'];
  public expenses: Expense[] = [];
  private previousFilters: HttpParams;
  public expenseViewId = "";
  public tableActionInput: TableActionInput = {
    pageName: "Expenses",
    icon: 'attach_money'
  };


  filterOptions: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "select",
      matSelectOptions: undefined
    },
    {
      field: "description",
      label: "Description",
      type: "text"
    },
    {
      field: "expense",
      label: "Expense",
      type: "number"
    }
  ];

  private _subject = new Subject();

  public EXPERIMENTAL_MODE = environment.experimentalMode;

  constructor(
    public sharedService: SharedService,
    private expenseService: ExpenseService,
    public dialog: DialogService,
    private categoryService: CategoriesService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = this.sharedService.mobileView ? this.mobileColumns : this.displayedColumns;
    this.categoryService.findAll(buildParams(0, 9999).append("categoryType", CategoryType.EXPENSE)).subscribe((res: ResponseWrapper) => {
      const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
      const index = this.filterOptions.indexOf(item);
      this.filterOptions[index].matSelectOptions = {
          options: res.data,
          displayBy: "category",
          valueBy: "id"
      };
    });
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
    this.expenseService
      .findAll(buildParams( this.page, this.size, this.sort, this.previousFilters))
      .pipe(takeUntil(this._subject))
      .subscribe((res: ResponseWrapper) => {
        this.expenses = res?.data;
        this.totalItems = res?.count;
        this.sharedService.checkLoadingSpinner();     
      },
      () => {
        this.sharedService.checkLoadingSpinner();
      });
  }

  openAddEditForm(expense?: Expense): void {
    console.log(expense);
    
    this.dialog
      .openDialog(AddExpenseComponent, expense)
      .onSuccess(() => this.query());
  }

  onMouseEnter(temp: any): void {
    console.log(temp);
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

  viewExpenseDetails(id: string): void {
    this.isSidenavOpened = true;
    this.expenseViewId = id;
    this.drawer.toggle();
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog.openConfirmDialog().onSuccess(() => this.delete(id));
  }

  delete(id: string): void {
    this.sharedService.activateLoadingSpinner();
    this.expenseService
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
