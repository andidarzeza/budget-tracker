import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { ColumnDefinition, Income, ResponseWrapper } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { buildParams } from 'src/app/utils/param-bulder';
import { AddIncomeComponent } from './add-income/add-income.component';
import { IncomeDetailsComponent } from './income-details/income-details.component';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatSidenavModule, BaseTableComponent, IncomeDetailsComponent],
})
export class IncomesComponent extends BaseTable<Income> implements OnInit, AfterViewInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly breakpointService = inject(BreakpointService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly categoryService = inject(CategoriesService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  sort: string = 'createdTime,desc';

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('INCOME');
  filterOptions = this.filterService.select('INCOME');

  createComponent = AddIncomeComponent;
  tableActionInput: TableActionInput = {
    pageName: 'Incomes',
    icon: 'transit_enterexit',
  };

  constructor() {
    super(inject(DialogService), inject(IncomeService), inject(ToastrService), inject(AccountService));
  }

  /**
   * Mobile *create* uses a routed full-screen page (native body scroll,
   * sticky header + footer); desktop create and any edit (mobile or
   * desktop) continue to use the dialog.
   */
  override openAddEditForm(entity?: Income): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/incomes/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.getCategories();
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }

  private getCategories(): void {
    this.categoryService
      .incomeCategories(buildParams(0, 9999).append('account', this.accountService?.getAccount()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: ResponseWrapper) => {
        const item = this.filterOptions.filter((filterOpt) => filterOpt.field == 'category')[0];
        item.matSelectOptions = {
          options: res.data,
          displayBy: 'category',
          valueBy: 'id',
        };
      });
  }
}
