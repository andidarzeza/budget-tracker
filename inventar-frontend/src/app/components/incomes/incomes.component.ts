import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddIncomeComponent } from './add-income/add-income.component';
import { TableActionInput } from 'src/app/shared/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { CategoryType, Income, ResponseWrapper } from 'src/app/models/models';
import { FilterOptions } from 'src/app/shared/table-actions/filter/filter.models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { EntityOperation } from 'src/app/core/EntityOperation';
import { BaseTable } from 'src/app/core/BaseTable';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css']
})
export class IncomesComponent extends BaseTable<Income> implements EntityOperation<Income>{

  columns: string[] = ['date', 'category', 'description', 'income', 'actions'];
  mobileColumns: string[] = ['category', 'income', 'actions'];
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
    public sharedService: SharedService,
    private incomeService: IncomeService,
    public dialog: DialogService,
    private toaster: ToastrService,
    private categoryService: CategoriesService,
    private sideBarService: SideBarService,
    private navBarService: NavBarService,
    public accountService: AccountService
  ) {
    super(sharedService, dialog);
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.columns = this.sharedService.mobileView ? this.mobileColumns : this.columns;
    this.getCategories();
    this.query();
  }

  private getCategories(): void {
    this.categoryService
      .findAll(buildParams(0, 9999).append("categoryType", CategoryType.INCOME).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this._subject))
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

  query(): void {
    this.sharedService.activateLoadingSpinner();
    this.incomeService
      .findAll(buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount()))
      .pipe(takeUntil(this._subject))
      .subscribe((res: ResponseWrapper) => {
        this.data = res?.data;
        this.totalItems = res?.count;
        this.sharedService.checkLoadingSpinner();
      },
      () => this.sharedService.checkLoadingSpinner());
  }

  openDeleteConfirmDialog(id: string): void {
    this.dialog.openConfirmDialog().onSuccess(() => this.delete(id));
  }

  delete(id: string): void {
    this.incomeService
      .delete(id)
      .pipe(takeUntil(this._subject))
      .subscribe(() => {
        this.query();
        this.toaster.info("Element deleted successfully", "Success", TOASTER_CONFIGURATION);
      });
  }


  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
