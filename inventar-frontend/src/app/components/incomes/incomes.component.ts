import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AddIncomeComponent } from './add-income/add-income.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { CategoryType, ColumnDefinition, Income, ResponseWrapper } from 'src/app/models/models';
import { FilterOptions } from 'src/app/shared/base-table/table-actions/filter/filter.models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css']
})
export class IncomesComponent extends BaseTable<Income>{
  sort: string = "createdTime,desc";

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("INCOME");

  createComponent = AddIncomeComponent;
  tableActionInput: TableActionInput = {
    pageName: "Incomes",
    icon: 'transit_enterexit'
  };

  filterOptions: FilterOptions[] = [
    {
      field: "category",
      label: "Category",
      type: "select",
      matSelectOptions: undefined
    }, {
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
    public incomeService: IncomeService,
    public dialog: DialogService,
    public toaster: ToastrService,
    public categoryService: CategoriesService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public accountService: AccountService,
    public columnDefinitionService: ColumnDefinitionService
  ) {
    super(dialog, incomeService, toaster, accountService);
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount());
  }
  
  ngOnInit(): void {        
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.getCategories();
    this.query();
  }

  private getCategories(): void {
    this.categoryService
      .findAll(buildParams(0, 9999).append("categoryType", CategoryType.INCOME).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: ResponseWrapper) => {
        const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
        const index = this.filterOptions.indexOf(item);
        this.filterOptions[index].matSelectOptions = {
          options: res.data,
          displayBy: "category",
          valueBy: "id"
        }
      });
  }

}
