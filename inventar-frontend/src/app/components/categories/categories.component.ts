import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AddCategoryComponent } from './add-category/add-category.component';
import { DialogService } from 'src/app/services/dialog.service';
import { Category, ColumnDefinition } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';

@Component({
  standalone: false,
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent extends BaseTable<Category> {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  sort: string = 'lastModifiedDate,desc';

  createComponent = AddCategoryComponent;
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('CATEGORY');
  filterOptions = this.filterService.select('CATEGORY');

  tableActionInput: TableActionInput = {
    pageName: 'Categories',
    icon: 'list_alt',
  };
  resetData: boolean = false;

  constructor(
    public categoriesService: CategoriesService,
    public dialog: DialogService,
    public toaster: ToastrService,
    public accountService: AccountService,
  ) {
    super(dialog, categoriesService, toaster, accountService);
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters)
      .append('account', this.accountService?.getAccount());
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }
}
