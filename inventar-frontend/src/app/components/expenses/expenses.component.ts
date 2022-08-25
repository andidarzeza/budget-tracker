import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { environment, PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { Subject } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog.service';
import { MatSidenav } from '@angular/material/sidenav';
import { CategoryType, ColumnDefinition, Expense, ResponseWrapper } from 'src/app/models/models';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { EntityOperation } from 'src/app/core/EntityOperation';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';

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

  columnDefinition: ColumnDefinition[] = [
    {
      column: 'createdTime',
      type: 'date'
    },
    {
      column: 'category',
      type: 'string'
    },
    {
      column: 'description',
      type: 'string'
    },
    {
      column: 'moneySpent',
      type: 'currency'
    },
    {
      column: 'actions',
      type: 'actions'
    }
  ];

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
  resetData: boolean = false;

  constructor(
    public sharedService: SharedService,
    private expenseService: ExpenseService,
    public dialog: DialogService,
    private categoryService: CategoriesService,
    private toaster: ToastrService,
    public accountService: AccountService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService
  ) { }


  onScroll(): void {
    this.page++;
    this.query();
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.categoryService.findAll(buildParams(0, 9999).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService?.getAccount())).subscribe((res: ResponseWrapper) => {
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

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.expenseService
      .findAll(buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this._subject))
      .subscribe((res: ResponseWrapper) => {
        this.expenses = this.resetData ? res.data : this.expenses.concat(res?.data);
        this.resetData = false;
        this.totalItems = res?.count;
        this.sharedService.checkLoadingSpinner();
      },
        () => {
          this.sharedService.checkLoadingSpinner();
        });
  }

  openAddEditForm(expense?: Expense): void {
    this.dialog
      .openDialog(AddExpenseComponent, expense)
      .onSuccess(() => {
        this.resetAndQuery()
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
        this.accountService.findOne(this.accountService.getAccount()).subscribe();
        this.sharedService.checkLoadingSpinner();
        this.resetAndQuery();
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

  resetAndQuery(): void {
    this.sharedService.scrollTableToTop();
    this.resetData = true;
    this.page = 0;
    this.query();
  }

  public getExpenseDate(date: any): string {
    const now = new Date();
    if (now.getTime() - new Date(date).getTime() < 24 * 60 * 60 * 1000) {
      return 'a day ago';
    }
    return date.getTime(date).toString();
  }
}
