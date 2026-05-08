import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { AddIncomeComponent } from './add-income/add-income.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { ColumnDefinition, Income, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';


@Component({
  standalone: false,
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesComponent extends BaseTable<Income> implements OnInit, AfterViewInit {
  // Field initializers need their dependencies already in scope; using
  // `inject()` directly here keeps them order-independent.
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly breakpointService = inject(BreakpointService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly categoryService = inject(CategoriesService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly router = inject(Router);

  sort: string = 'createdTime,desc';

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('INCOME');
  filterOptions = this.filterService.select('INCOME');

  createComponent = AddIncomeComponent;
  tableActionInput: TableActionInput = {
    pageName: 'Incomes',
    icon: 'transit_enterexit',
  };

  constructor(
    public incomeService: IncomeService,
    public dialog: DialogService,
    public toaster: ToastrService,
    public accountService: AccountService,
  ) {
    super(dialog, incomeService, toaster, accountService);
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

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters)
      .append('account', this.accountService?.getAccount());
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.getCategories();
    this.query();
  }

  private getCategories(): void {
    this.categoryService
      .incomeCategories(buildParams(0, 9999).append('account', this.accountService?.getAccount()))
      .pipe(takeUntil(this.unsubscribe$))
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
