import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { QrScannerDialogComponent } from './qr-scanner-dialog/qr-scanner-dialog.component';
import { TableActionInput } from 'src/app/shared/base-table/table-actions/TableActionInput';
import { DialogService } from 'src/app/services/dialog.service';
import { CategoryType, ColumnDefinition, Expense, ResponseWrapper } from 'src/app/models/models';
import { buildParams } from 'src/app/utils/param-bulder';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { AccountService } from 'src/app/services/account.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ColumnDefinitionService } from 'src/app/core/services/column-definition.service';
import { BaseTable } from 'src/app/core/BaseTable';
import { HttpParams } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({ standalone: false,
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent extends BaseTable<Expense> implements OnInit{

  // Field initializers need their dependencies already in scope; using
  // `inject()` directly here keeps them order-independent and avoids the
  // "used before initialization" trap with `this.*Service`.
  readonly columnDefinitionService = inject(ColumnDefinitionService);
  readonly filterService = inject(FilterService);
  readonly breakpointService = inject(BreakpointService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  private readonly categoryService = inject(CategoriesService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly expenseService = inject(ExpenseService);
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);

  createComponent = AddExpenseComponent;
  sort: string = "createdTime,desc";
  columnDefinition: ColumnDefinition[] = this.columnDefinitionService.get("EXPENSE");
  filterOptions = this.filterService.select("EXPENSE");
  public tableActionInput: TableActionInput = {
    pageName: "Expenses",
    icon: 'attach_money'
  };

  constructor(
    public dialog: DialogService,
    protected toaster: ToastrService,
    protected accountService: AccountService,
  ) {
    // BaseTable's constructor wires `entityService` into the `query()` /
    // `delete()` chain — pass via `inject()` so the field below stays
    // available for the QR-prefill flow.
    super(dialog, inject(ExpenseService), toaster, accountService);
  }

  /**
   * Mobile *create* uses a routed full-screen page (native body scroll,
   * sticky header + footer); desktop create and any edit (mobile or
   * desktop) continue to use the dialog.
   */
  override openAddEditForm(entity?: Expense): void {
    if (!entity && this.breakpointService.matchesMobileCreateLayout()) {
      this.router.navigate(['/expenses/add']);
      return;
    }
    super.openAddEditForm(entity);
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.categoryService.findAll(buildParams(0, 9999).append("categoryType", CategoryType.EXPENSE).append("account", this.accountService?.getAccount())).subscribe((res: ResponseWrapper) => {
      const item = this.filterOptions.filter(filterOpt => filterOpt.field == "category")[0];
      const index = this.filterOptions.indexOf(item);
      this.filterOptions[index].matSelectOptions = {
        options: res.data,
        displayBy: "category",
        valueBy: "id"
      };
    });
    this.query();
  }

  getQueryParams(): HttpParams {
    return buildParams(this.page, this.size, this.sort, this.previousFilters).append("account", this.accountService?.getAccount());
  }

  openQrScanner(): void {
    if (!this.breakpointService.matchesMobileCreateLayout()) {
      return;
    }

    this.matDialog.open(QrScannerDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100dvh',
      maxHeight: '100dvh',
      panelClass: ['qr-scanner-dialog-panel']
    }).afterClosed().subscribe((scannedValue: string | null) => {
      if (!scannedValue) {
        return;
      }
      this.handleScannedUrl(scannedValue);
    });
  }

  private handleScannedUrl(rawValue: string): void {
    this.expenseService.verifyInvoiceFromScannedUrl(rawValue).subscribe({
      next: (response: any) => {
        const totalPrice = Number(response?.totalPrice);
        const sellerName = String(response?.seller?.name || '').trim();
        if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
          this.toaster.error(
            'Scanned invoice does not contain a valid total price.',
            'Invalid invoice',
            TOASTER_CONFIGURATION
          );
          return;
        }
        this.dialog.openDialog(AddExpenseComponent, {
          moneySpent: totalPrice,
          currency: 'ALL',
          description: sellerName
        }).onSuccess(() => this.resetAndQuery());
      },
      error: () => {
        this.toaster.error(
          'Could not verify scanned invoice. Please try again.',
          'Verification failed',
          TOASTER_CONFIGURATION
        );
      }
    });
  }

}
