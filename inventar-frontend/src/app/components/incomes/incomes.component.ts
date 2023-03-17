import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AddIncomeComponent } from './add-income/add-income.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { ColumnDefinition, Income, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { HttpParams } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';


@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css']
})
export class IncomesComponent extends BaseTable<Income> implements OnInit, AfterViewInit {
  sort: string = "createdTime,desc";

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("INCOME");
  filterOptions = this.filterService.select("INCOME");

  createComponent = AddIncomeComponent;
  tableActionInput: TableActionInput = {
    pageName: "Incomes",
    icon: 'transit_enterexit'
  };


  constructor(
    public incomeService: IncomeService,
    public dialog: DialogService,
    public toaster: ToastrService,
    public categoryService: CategoriesService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public accountService: AccountService,
    public columnDefinitionService: ColumnDefinitionService,
    public filterService: FilterService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super(dialog, incomeService, toaster, accountService);
  }
  
  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();   

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
      .incomeCategories(buildParams(0, 9999).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: ResponseWrapper) => {
        const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
        item.matSelectOptions = {
          options: res.data,
          displayBy: "category",
          valueBy: "id"
        }
      });
  }

}
