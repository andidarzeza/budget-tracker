import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddCategoryComponent } from './add-category/add-category.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogService } from 'src/app/services/dialog.service';
import { filter, takeUntil } from 'rxjs/operators';
import { EntityOperation } from 'src/app/models/core/EntityOperation';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSidenav } from '@angular/material/sidenav';
import { Category } from 'src/app/models/models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy, EntityOperation<Category> {

  isSidenavOpened: boolean = false;
  @ViewChild('drawer') drawer: MatSidenav;
  categoryId: string;


  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public page: number = 0;
  public size: number = PAGE_SIZE;
  public totalItems: number = 0;
  public totalRequests: number = 0;
  public categoriesType: string = 'spendings';
  public theme: string = 'light';
  public displayedColumns: string[] = ['icon', 'category', 'description', 'actions'];
  public dataSource: Category[] = [];
  public defaultSort: string = "createdTime,desc";
  public sort: string = this.defaultSort;
  private _subject = new Subject();

  constructor(
    public sharedService: SharedService,
    private categoriesService: CategoriesService,
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
    this.sharedService.scrollTableToTop();
  }

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.categoriesService
      .findAll(this.page, this.size, this.categoriesType, this.sort)
      .pipe(takeUntil(this._subject))
      .subscribe((res: HttpResponse<any>) => {
        this.dataSource = res?.body.categories;
        this.totalItems = res?.body.count;
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
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.query());
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog
      .openConfirmDialog(ConfirmComponent)
      .afterClosed()
      .pipe(takeUntil(this._subject), filter((update)=>update))
      .subscribe(() => this.delete(id));
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
        this.categoriesType = 'spendings';
        break;
      case 1:
        this.categoriesType = 'incomings';
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
