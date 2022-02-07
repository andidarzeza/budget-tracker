import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/models/Category';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddCategoryComponent } from './add-category/add-category.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogService } from 'src/app/services/dialog.service';
import { filter } from 'rxjs/operators';
import { EntityOperation } from 'src/app/models/core/EntityOperation';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy, EntityOperation<Category> {
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
  private categoriesSubscription: Subscription = null;
  private deleteSubscription: Subscription = null;

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
    this.categoriesSubscription?.unsubscribe();
    this.categoriesSubscription =  this.categoriesService.findAll(this.page, this.size, this.categoriesType, this.sort).subscribe((res: HttpResponse<any>) => {
      this.dataSource = res?.body.categories;
      this.totalItems = res?.body.count;
      this.sharedService.checkLoadingSpinner();     
    });
  }

  openAddEditForm(spendingCategory?: Category): void {
    this.dialog.openDialog(AddCategoryComponent, {spendingCategory, categoriesType: this.categoriesType})
      .afterClosed()
      .pipe(filter((update)=>update))
      .subscribe(() => this.query());
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog.openConfirmDialog(ConfirmComponent)
      .afterClosed()
      .pipe(filter((update)=>update))
      .subscribe(() => this.delete(id));
  }

  delete(id: string): void {
    this.deleteSubscription?.unsubscribe();
    this.deleteSubscription = this.categoriesService.delete(id).subscribe(() => {
      this.query();
      this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
    });
  }

  changeCategoriesType(event: MatTabChangeEvent): void {
    console.log(event);
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
    this.categoriesSubscription?.unsubscribe();
    this.deleteSubscription?.unsubscribe()
  }
}
