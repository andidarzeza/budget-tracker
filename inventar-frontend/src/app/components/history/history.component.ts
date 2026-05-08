import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToastrService } from 'ngx-toastr';
import { BaseTable } from 'src/app/core/BaseTable';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { ColumnDefinition, History } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { HistoryService } from 'src/app/services/pages/history.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { BaseTableComponent } from 'src/app/shared/base-table/base-table.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { buildParams } from 'src/app/utils/param-bulder';
import { HistoryDetailsComponent } from './history-details/history-details.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatSidenavModule, BaseTableComponent, HistoryDetailsComponent],
})
export class HistoryComponent extends BaseTable<History> implements OnInit {
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly historyService = inject(HistoryService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  sort: string = 'date,desc';
  createComponent: any;

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get('HISTORY');

  tableActionInput: TableActionInput = {
    pageName: 'History',
    icon: 'history',
    extra: {
      hideInsertButton: true,
    },
  };

  filterOptions = this.filterService.select('HISTORY');

  constructor() {
    super(inject(DialogService), inject(HistoryService), inject(ToastrService), inject(AccountService));
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append(
      'account',
      this.accountService?.getAccount(),
    );
  }
}
