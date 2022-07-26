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
import { DashboardDTO } from 'src/app/models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {
  
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

  // fires only from onDateSelected function below
  private getDashboardData(): void {
    const currentYear: Year = this.dateUtil.fromYear(this.selectedDate.getFullYear());
    const currentMonth: Month = currentYear.getMonthByValue(this.selectedDate.getMonth());
    const days: Day[] = currentMonth.getDaysOfMonth();

    this.dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    this.sharedService.activateLoadingSpinner();

    
    this.dashboardService.getDashboardData(
      new Date(currentYear.getYear(), currentMonth.getMonth()),
      new Date(currentYear.getYear(), currentMonth.getMonth()+1)
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
    return days.map(day => {
      const dayString: string = (day?.getDayNumber() <= 9) ? "0" + day?.getDayNumber().toString() : day?.getDayNumber().toString();
      const monthString: string = (currentMonth.getMonth() + 1 <= 9) ? "0" + (currentMonth.getMonth() + 1).toString() : (currentMonth.getMonth() + 1).toString();
      return dayString + "-" + monthString + "-" + currentYear.getYear().toString()
    });
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
