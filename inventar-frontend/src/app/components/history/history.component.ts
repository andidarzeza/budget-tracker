import { Component, OnInit,  } from '@angular/core';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { ColumnDefinition, History } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { DialogService } from 'src/app/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent extends BaseTable<History> implements OnInit{
  sort: string = "date,desc";
  createComponent: any;

  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("HISTORY");

  public tableActionInput: TableActionInput = {
    pageName: "History",
    icon: 'history',
    extra: {
      hideInsertButton: true
    }
  };

  filterOptions = this.filterService.select("HISTORY");

  constructor(
    private historyService: HistoryService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public accountService: AccountService,
    public dialog: DialogService,
    protected toaster: ToastrService,
    public filterService: FilterService,
    public columnDefinitionService: ColumnDefinitionService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super(dialog, historyService, toaster, accountService);
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters)
      .append("account", this.accountService?.getAccount());
  }

}
