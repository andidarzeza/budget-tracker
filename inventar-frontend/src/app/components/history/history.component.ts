import { Component,  } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { FilterOptions } from 'src/app/shared/base-table/table-actions/filter/filter.models';
import { takeUntil } from 'rxjs/operators';
import { ColumnDefinition, ENTITIES, EntityAction, EntityType, ENTITY_ACTIONS, History, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { DialogService } from 'src/app/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent extends BaseTable<History>{

  createComponent: any;


  columnDefinition: ColumnDefinition[] = [
    {
      column: 'date',
      label: 'Date',
      type: 'date'
    },
    {
      column: 'action',
      label: 'Action',
      type: 'string'
    },
    {
      column: 'entity',
      label: 'Entity',
      type: 'string'
    },
    {
      column: 'message',
      label: 'Message',
      type: 'string'
    },
    {
      column: 'user',
      label: 'User',
      type: 'string'
    },
    {
      column: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];

  public tableActionInput: TableActionInput = {
    pageName: "History",
    icon: 'history',
    extra: {
      hideInsertButton: true
    }
  };

  filterOptions: FilterOptions[] = [
    {
      field: "action",
      label: "Action",
      type: "select",
      matSelectOptions: this.getActions()
    },
    {
      field: "entity",
      label: "Entity",
      type: "select",
      matSelectOptions: this.getEntities()
    },
    {
      field: "message",
      label: "Message",
      type: "text"
    }
  ];
  resetData: boolean = false;

  constructor(
    public sharedService: SharedService,
    private historyService: HistoryService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public accountService: AccountService,
    public dialog: DialogService,
    protected toaster: ToastrService,

  ) {
    super(sharedService, dialog, historyService, toaster, accountService);
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.query();
  }

  private getActions() {
    return {
      options: ENTITY_ACTIONS.map((action: EntityAction) => {
        return {
          display: action.toUpperCase(),
          value: action.toUpperCase()
        }
      }),
      displayBy: "display",
      valueBy: "value"
    }
  }

  private getEntities() {
    return {
      options: ENTITIES.map((action: EntityType) => {
        return {
          display: action.toUpperCase(),
          value: action.toUpperCase()
        }
      }),
      displayBy: "display",
      valueBy: "value"
    }
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters)
      .append("account", this.accountService?.getAccount());
  }

}
