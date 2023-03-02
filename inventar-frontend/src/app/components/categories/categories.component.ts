import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AddCategoryComponent } from './add-category/add-category.component';
import { DialogService } from 'src/app/services/dialog.service';
import { Category, CategoryType, ColumnDefinition } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { HttpParams } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent extends BaseTable<Category> {
  sort: string = "lastModifiedDate,desc";
  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount())
  }
  
  createComponent = AddCategoryComponent;
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("CATEGORY");

  filterOptions = this.filterService.select("CATEGORY");

  public tableActionInput: TableActionInput = {
    pageName: "Categories",
    icon: 'list_alt'
  };
  resetData: boolean = false;

  constructor(
    public categoriesService: CategoriesService,
    public dialog: DialogService, 
    public toaster: ToastrService,
    public sideBarService: SideBarService,
    public accountService: AccountService,
    public navBarService: NavBarService,
    public columnDefinitionService: ColumnDefinitionService,
    public filterService: FilterService
  ) {
    super(dialog, categoriesService, toaster, accountService);
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

}
