import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddIncomeComponent } from './add-income/add-income.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { filter, takeUntil } from 'rxjs/operators';
import { EntityOperation } from 'src/app/models/core/EntityOperation';
import { MatSidenav } from '@angular/material/sidenav';
import { CategoryType, Income } from 'src/app/models/models';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css']
})
export class IncomesComponent implements OnInit, OnDestroy, EntityOperation<Income> {
  @ViewChild('drawer') drawer: MatSidenav;
  isSidenavOpened: boolean = false;
  public incomeViewId = "";
  public incomes: Income[] = [];
  public totalItems: number = 0;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  private page: number = 0;
  public size: number = PAGE_SIZE;
  private defaultSort: string = "createdTime,desc";
  private sort: string = this.defaultSort;
  public displayedColumns: string[] = ['date', 'category', 'description', 'income', 'actions'];
  public mobileColumns: string[] = ['category', 'income', 'actions'];

  private _subject = new Subject();

  private previousFilters: HttpParams;
  public tableActionInput: TableActionInput = {
    pageName: "Incomes",
    icon: 'transit_enterexit'
  };

  filterOptions: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "select",
      matSelectOptions: undefined
    },{
      field: "description",
      label: "Description",
      type: "text"
    },
    {
      field: "income",
      label: "Income",
      type: "number"
    }
  ];

  constructor(
    public sharedService: SharedService,
    private incomingsService: IncomingsService,
    public dialog: DialogService,
    private toaster: ToastrService,
    private categoryService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = this.sharedService.mobileView ? this.mobileColumns : this.displayedColumns;
    this.getCategories();
    this.query();
  }

  private getCategories(): void {
    this.categoryService
      .findAll(0, 9999, CategoryType.INCOME)
      .pipe(takeUntil(this._subject))
      .subscribe(res => {
        const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
        const index = this.filterOptions.indexOf(item);
        this.filterOptions[index].matSelectOptions = {
          options: res.body.data,
          displayBy: "category",
          valueBy: "id"
        }
      }
        
      );
  }

  paginatorEvent(event: PageEvent): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
    this.sharedService.scrollTableToTop();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.incomingsService
      .findAll(this.page, this.size, this.sort, this.previousFilters)
      .pipe(takeUntil(this._subject))
      .subscribe((res: HttpResponse<any>) => {
        this.incomes = res?.body.data;
        this.totalItems = res?.body.count;
        this.sharedService.checkLoadingSpinner();     
      },
      () => {
        this.sharedService.checkLoadingSpinner();
      });
  }

  openAddEditForm(income?: Income): void {
    this.dialog.openDialog(AddIncomeComponent, income)
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.query());
  }

  viewDetails(id: string): void {
    this.isSidenavOpened = true;
    this.incomeViewId = id;
    this.drawer.toggle();
  }

  onSidenavClose(): void {
    this.isSidenavOpened = false;
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog
      .openConfirmDialog(ConfirmComponent)
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.delete(id));
  }
  
  delete(id: string): void {
    this.incomingsService
      .delete(id)
      .pipe(takeUntil(this._subject))
      .subscribe(() => {
        this.query();
        this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
      });
  }

  announceSortChange(sort: Sort): void {
    this.sort = sort.direction ? `${sort.active},${sort.direction}` : this.defaultSort;
    this.query();
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

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
