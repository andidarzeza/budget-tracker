import { Component, OnDestroy } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { Subject } from 'rxjs';
import { FloatingMenuConfig } from 'src/app/shared/floating-menu/FloatingMenuConfig';
import { ExportService } from 'src/app/services/export.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { PdfExporterService } from 'src/app/services/pdf-exporter.service';
import { DashboardDTO, RangeType } from 'src/app/models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  selectedRange: RangeType = "Monthly";

  
  ranges: RangeType[] = ["Monthly", "Yearly"];
  selectedDate = new Date();
  dateUtil = new DateUtil();
  currentMonth = this.selectedDate.getMonth();
  private _subject = new Subject();
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

  dashboardData: DashboardDTO;
  dailyExpensesLabels: string[] = [];

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    public sharedService: SharedService,
    public exportService: ExportService,
    private toasterService: ToastrService,
    private pdfExporter: PdfExporterService
  ) {}

  selectRange(range: RangeType): void {
    this.selectedRange = range;
    this.getDashboardData();
  }

  // fires only from onDateSelected function below
  private getDashboardData(): void {
    const currentYear: Year = this.dateUtil.fromYear(this.selectedDate.getFullYear());
    const currentMonth: Month = currentYear.getMonthByValue(this.selectedDate.getMonth());
    const days: Day[] = currentMonth.getDaysOfMonth();

    this.dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    this.sharedService.activateLoadingSpinner();

    const from = this.getFromDate(currentYear, currentMonth);
    const to = this.getToDate(currentYear, currentMonth);

    
    this.dashboardService.getDashboardData(
      from,
      to,
      this.selectedRange
    )
    .pipe(takeUntil(this._subject))
    .subscribe((dashboardData: DashboardDTO) => {
      this.sharedService.checkLoadingSpinner();
      this.dashboardData = dashboardData;
    }, () => {
      this.sharedService.checkLoadingSpinner();
      this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION);
    });
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

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }
}
