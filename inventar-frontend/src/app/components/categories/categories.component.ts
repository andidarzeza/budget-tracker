import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { AddCategoryComponent } from './add-category/add-category.component';
import { DialogService } from 'src/app/services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { Category, CategoryType, ColumnDefinition, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { FilterOptions } from 'src/app/shared/base-table/table-actions/filter/filter.models';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent extends BaseTable<Category> implements OnInit, OnDestroy {
  
  createComponent = AddCategoryComponent;
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.columnDefinitions.get("CATEGORY");

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
    

  public categoriesType: CategoryType = CategoryType.EXPENSE;
  public tableActionInput: TableActionInput = {
    pageName: "Categories",
    icon: 'library_books'
  };
  resetData: boolean = false;

  constructor(
    public sharedService: SharedService,
    public categoriesService: CategoriesService,
    public dialog: DialogService, 
    public toaster: ToastrService,
    public sideBarService: SideBarService,
    public accountService: AccountService,
    public navBarService: NavBarService,
    public columnDefinitionService: ColumnDefinitionService
  ) {
    super(sharedService, dialog, categoriesService, toaster, accountService);
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  query(): void {
    this.categoriesService
      .findAll(buildParams(this.page, this.size, this.sort, this.previousFilters).append("categoryType", this.categoriesType).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this.subject))
      .subscribe((res: ResponseWrapper) => {
        this.stopLoading = res.data.length < this.size;
        this.data = this.resetData ? res?.data : this.data.concat(res?.data);
        this.totalItems = res?.count;
      });
  }

}
