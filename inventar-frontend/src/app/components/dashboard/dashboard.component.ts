import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { Subject } from 'rxjs';
import { FloatingMenuConfig } from 'src/app/shared/floating-menu/FloatingMenuConfig';
import { ExportService } from 'src/app/services/export.service';
import { DailyExpenseDTO, DashboardDTO } from 'src/app/models/DashboardModels';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from 'src/app/services/theme.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedDate = new Date();
  dateUtil = new DateUtil();
  currentMonth = this.selectedDate.getMonth();
  private _subject = new Subject();
  chart: Chart = null; 
  category_chart: Chart = null;
  incomes_chart: Chart = null;
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
          ).subscribe((pdfDocument: Blob) => this.exportToPDF(pdfDocument))
        }
      }
    ]
  };

  dashboardData: DashboardDTO;

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    public sharedService: SharedService,
    public exportService: ExportService,
    private toasterService: ToastrService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    this.listenForColorChange();
  }

  private listenForColorChange(): void {
    this.themeService.colorChange.subscribe((color: string) => {
      this.sharedService.changeColor(this.chart, this.getChartBackgroundColor(color), color);
    });
  }

  private getChartBackgroundColor(color: string): string {
    return color.substring(0, color.length - 2)+ '0.5)';
  }

  // fires only from onDateSelected function below
  private getDashboardData(): void {
    const currentYear: Year = this.dateUtil.fromYear(this.selectedDate.getFullYear());
    const currentMonth: Month = currentYear.getMonthByValue(this.selectedDate.getMonth());
    const days: Day[] = currentMonth.getDaysOfMonth();

    let dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    this.sharedService.activateLoadingSpinner();

    
    this.dashboardService.getDashboardData(
      new Date(currentYear.getYear(), currentMonth.getMonth()),
      new Date(currentYear.getYear(), currentMonth.getMonth()+1)
    )
    .pipe(takeUntil(this._subject))
    .subscribe((dashboardData: DashboardDTO) => {
      this.sharedService.checkLoadingSpinner();
      this.dashboardData = dashboardData;

      this.createDailyChart(
        dailyExpensesLabels, 
        this.getDailyExpensesData(dailyExpensesLabels, dashboardData.dailyExpenses)
      );

    }, () => {
      this.sharedService.checkLoadingSpinner();
      this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION);
    });
  }

  public get increaseInExpense() {
    return this.dashboardData?.increaseInExpense ?? 0;
  }

  public get increaseInIncome() {
    return this.dashboardData?.increaseInIncome ?? 0;
  }

  public get totalIncome() {
    return this.dashboardData?.incomes ?? 0;
  }

  public get totalSpendings() {
    return this.dashboardData?.expenses ?? 0;
  }

  public get amountSpentAverage() {
    return this.dashboardData?.averageDailyExpenses ?? 0;
  }

  public get dailyIncomeAverage() {
    return this.dashboardData?.averageDailyIncome ?? 0;
  }

  public get expenseCategoriesData() {
    return this.dashboardData?.expensesInfo ?? [];
  }

  private exportToPDF(pdfDocument: Blob): void {
    const fileURL = URL.createObjectURL(pdfDocument);
    const a = document.createElement('a');
    a.href = fileURL;
    a.target = '_blank';
    a.download = 'Monthly-Report-DEC/2021.pdf';
    document.body.appendChild(a);
    a.click();
  }

  private getMonthlyLabels(days: Day[], currentYear: Year, currentMonth: Month): string[] {
    return days.map(day => {
      const dayString: string = (day?.getDayNumber() <= 9) ? "0" + day?.getDayNumber().toString() : day?.getDayNumber().toString();
      const monthString: string = (currentMonth.getMonth() + 1 <= 9) ? "0" + (currentMonth.getMonth() + 1).toString() : (currentMonth.getMonth() + 1).toString();
      return dayString + "-" + monthString + "-" + currentYear.getYear().toString()
    });
  }

  private createDailyChart(labels: string[], data: number[]): void {
    if(this.chart) {
      this.chart.destroy();
    }
    const color = localStorage.getItem("themeColor");
    const chartBackgoundColor = this.getChartBackgroundColor(color);
    this.chart = this.chartUtil.createChart("daily-chart", {
      type: 'line',
      colors: ['#ff6347'],
      labels: labels.map(label => {
        const array = label.split("-");
        return array[0] + "/" + array[1] + "/" + array[2].slice(-2);
      }),
      showGridLines: true,
      datasets: [{
        label: 'Money Spent',
        data,
        fill: true,
        tension: 0.2,
        backgroundColor: [chartBackgoundColor],
        borderColor: [color],
        pointBackgroundColor : color,
        borderWidth: 1
      }]
    });
  }


  getDailyExpensesData(dailyExpensesLabels: string[], dailyExpenses: DailyExpenseDTO[]): number[] {
    return dailyExpensesLabels
      .map((label: string) => {
        const filtered: DailyExpenseDTO[] = dailyExpenses.filter((dailyExpenseDTO: DailyExpenseDTO) => dailyExpenseDTO._id === label);
        return filtered.length !== 0 ? filtered[0].dailyExpense : 0;
      });
  }

  calculateHeight(templateReference: HTMLElement): string {
    let clientHeight = templateReference.clientHeight;
    clientHeight += 126;
    return `calc(100% - ${clientHeight}px)`;
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
