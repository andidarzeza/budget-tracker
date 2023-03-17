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
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends Unsubscribe implements AfterViewInit {

  date = new Date();

  from = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  to = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);
  



  selectedRange: RangeType = "Monthly";
  ranges: RangeType[] = ["Monthly", "Yearly"];
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
    this.getDashboardData();
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



  // fires only from onDateSelected function below
  private getDashboardData(): void {
    
    const currentYear: Year = this.dateUtil.fromYear(this.selectedDate.getFullYear());
    const currentMonth: Month = currentYear.getMonthByValue(this.selectedDate.getMonth());
    const days: Day[] = currentMonth.getDaysOfMonth();

    this.dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    const from = this.getFromDate(currentYear, currentMonth);
    const to = this.getToDate(currentYear, currentMonth);

    this.dashboardService.getDashboardData(
      this.from,
      this.to,
      this.selectedRange
    )
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((dashboardData: DashboardDTO) => {
      this.dashboardData = dashboardData;
    }, () => {
      this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION);
    });
  }

  onRangeSelect(range: RangeType): void {
    this.selectedRange = range;
    this.getDashboardData();
  }

  private getMonthlyLabels(days: Day[], currentYear: Year, currentMonth: Month): string[] {
    if(this.selectedRange === "Monthly") {
      return days.map(day => {
        const dayString: string = (day?.getDayNumber() <= 9) ? "0" + day?.getDayNumber().toString() : day?.getDayNumber().toString();
        const monthString: string = (currentMonth.getMonth() + 1 <= 9) ? "0" + (currentMonth.getMonth() + 1).toString() : (currentMonth.getMonth() + 1).toString();
        return dayString + "-" + monthString + "-" + currentYear.getYear().toString()
      });
    } else {
      return currentYear.getYearMonths().map((month: Month) => {
        const m = month.getMonth() + 1; 
        return (m <=9 ? "0" + m.toString() : m.toString()) + "-" + currentYear.getYear().toString();
      });
    }
    
  }

  private getFromDate(year: Year, month: Month): Date {
    if(this.selectedRange =="Monthly") {
      return new Date(year.getYear(), month.getMonth());
    }
    return new Date(year.getYear(), 0);
  }

  private getToDate(year: Year, month: Month): Date {
    if(this.selectedRange =="Monthly") {
      return new Date(year.getYear(), month.getMonth()+1);
    }
    return new Date(year.getYear(), 12);
  }
  
  get expenseCategoriesData() {
    return this.dashboardData?.expensesInfo ?? [];
  }

  get dailyExpenses() {
    return this.dashboardData?.dailyExpenses;
  }

  onDateSelected(event: any): void {
    this.selectedDate = event.dateFrom;
    this.getDashboardData();
  }


}
