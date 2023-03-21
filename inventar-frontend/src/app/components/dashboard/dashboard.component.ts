import { AfterViewInit, Component } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { FloatingMenuConfig } from 'src/app/shared/floating-menu/FloatingMenuConfig';
import { ExportService } from 'src/app/services/export.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { PdfExporterService } from 'src/app/services/pdf-exporter.service';
import { DashboardDTO, RangeType } from 'src/app/models/models';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { inOutAnimation } from 'src/app/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [inOutAnimation]
})
export class DashboardComponent extends Unsubscribe implements AfterViewInit {

  from: Date;
  to: Date;
  loading = true;

  selectedRange: RangeType = "1D";
  ranges: RangeType[] = ["1D", "1W", "1M", "1Y", "MAX"];
  selectedDate = new Date();
  dateUtil = new DateUtil();
  currentMonth = this.selectedDate.getMonth();
  public floatingMenu: FloatingMenuConfig = {
    position: "above",
    buttons: [
      {
        tooltip: "Export as PDF",
        icon: "picture_as_pdf",
        action: () => {
          this.exportService.exportDashboardPDF(
            new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()),
            new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1)
          ).subscribe((pdfDocument: Blob) => this.pdfExporter.exportToPDF(pdfDocument))
        }
      }
    ]
  };

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
    Chart.register(...registerables);
    this.chartUtil.createDoughnutChart("category-chart");
  }

  dashboardData: DashboardDTO;
  dailyExpensesLabels: string[] = [];

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    public sharedService: SharedService,
    public exportService: ExportService,
    private toasterService: ToastrService,
    private pdfExporter: PdfExporterService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public router: Router,  
    public accountService: AccountService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
  }



  private getDashboardData(): void {
    
    this.dashboardService.getDashboardData(
      this.from, this.to, this.selectedRange
    )
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((dashboardData: DashboardDTO) => {
      this.loading = false;
      this.dashboardData = dashboardData;
    }, () => {
      this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION);
    });
  }

  onRangeSelect(range: RangeType): void {
    this.selectedRange = range;
    this.getDashboardData();
  }
  
  get expenseCategoriesData() {
    return this.dashboardData?.expensesInfo ?? [];
  }

  get dailyExpenses() {
    return this.dashboardData?.dailyExpenses;
  }

  onDateSelected(dateRange: {from: Date, to: Date}): void {
    this.loading = true;
    this.from = dateRange.from;
    this.to = dateRange.to;
    this.getDashboardData();
  }


}
