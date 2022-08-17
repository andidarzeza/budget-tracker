import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddCategoryComponent } from './add-category/add-category.component';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogService } from 'src/app/services/dialog.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSidenav } from '@angular/material/sidenav';
import { Category, CategoryType, ResponseWrapper } from 'src/app/models/models';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { EntityOperation } from 'src/app/core/EntityOperation';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy, EntityOperation<Category> {

  isSidenavOpened: boolean = false;
  @ViewChild('drawer') drawer: MatSidenav;
  categoryId: string;
  previousFilters: HttpParams;
  filterOptions: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "text"
    },
    {
      field: "description",
      label: "Description",
      type: "text"
    }
  ];

  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  public totalRequests: number = 0;
  public categoriesType: CategoryType = CategoryType.EXPENSE;
  public theme: string = 'light';
  public displayedColumns: string[] = ['icon', 'category', 'description', 'actions'];
  public dataSource: Category[] = [];
  public defaultSort: string = "createdTime,desc";
  public sort: string = this.defaultSort;
  private _subject = new Subject();
  public tableActionInput: TableActionInput = {
    pageName: "Categories",
    icon: 'library_books'
  };

  constructor(
    public sharedService: SharedService,
    private categoriesService: CategoriesService,
    public dialog: DialogService, 
    private toaster: ToastrService,
    public sideBarService: SideBarService,
    public accountService: AccountService,
    public navBarService: NavBarService
  ) {}

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.categoriesService
      .findAll(buildParams(this.page, this.size, this.sort, this.previousFilters).append("categoryType", this.categoriesType).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this._subject))
      .subscribe((res: ResponseWrapper) => {
        this.dataSource = res?.data;
        this.totalItems = res?.count;
        this.sharedService.checkLoadingSpinner();     
      },
      () => {
        this.sharedService.checkLoadingSpinner();
      });
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  viewCategoryDetails(id: string): void {
    this.categoryId = id;
    this.isSidenavOpened = true;
    this.drawer.toggle();
  }

  openAddEditForm(spendingCategory?: Category): void {
    this.dialog
      .openDialog(AddCategoryComponent, {spendingCategory, categoriesType: this.categoriesType})
      .onSuccess(() => this.query());
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

  openDeleteConfirmDialog(id: string): void {
    this.dialog
    .openConfirmDialog()
    .onSuccess(() => this.delete(id));
  }

  delete(id: string): void {
    this.categoriesService
      .delete(id)
      .pipe(takeUntil(this._subject))
      .subscribe(() => {
        this.query();
        this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
      });
  }

  changeCategoriesType(event: MatTabChangeEvent): void {
    switch(event.index) {
      case 0:
        this.categoriesType = CategoryType.EXPENSE;
        break;
      case 1:
        this.categoriesType = CategoryType.INCOME;
        break;
    }
    this.page = 0;
    this.query();
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
