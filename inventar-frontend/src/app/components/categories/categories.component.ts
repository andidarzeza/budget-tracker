import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { Category, ColumnDefinition } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { buildParams } from 'src/app/utils/param-bulder';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatSidenavModule, BaseTableComponent, CategoryDetailComponent],
})
export class CategoriesComponent extends BaseTable<Category> implements OnInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly router = inject(Router);
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

  constructor() {
    super(inject(DialogService), inject(CategoriesService), inject(ToastrService), inject(AccountService));
  }

  override openAddEditForm(entity?: Category): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/categories/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }
}
