import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { strToColor } from 'src/app/utils/ColorUtil';
import { Subscription } from 'rxjs';
import { FloatingMenuConfig } from 'src/app/shared/floating-menu/FloatingMenuConfig';
import { ExportService } from 'src/app/services/export.service';
import { DailyExpenseDTO, DashboardDTO, ExpenseInfoDTO, IncomeInfoDTO } from 'src/app/models/DashboardModels';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedDate = new Date();
  dateUtil = new DateUtil();
  currentMonth = this.selectedDate.getMonth();
  increaseInIncome: number = 0;
  increaseInExpense: number = 0;
  totalSpendings: number = 0;
  totalIncome: number = 0;
  amountSpentAverage: number = 0;
  dailyIncomeAverage: number = 0;
  dashboardSubscription: Subscription = null;
  chart: Chart = null; 
  category_chart: Chart = null;
  incomes_chart: Chart = null;
  expenseCategoriesData: ExpenseInfoDTO[] = [];
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
  private getDashboardData(dateFrom: Date): void {
    this.dashboardSubscription?.unsubscribe();

    const currentYear = this.dateUtil.fromYear(dateFrom.getFullYear());
    const currentMonth = currentYear.getMonthByValue(dateFrom.getMonth());
    const days = currentMonth.getDaysOfMonth();

    let dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    this.sharedService.activateLoadingSpinner();

    this.dashboardSubscription = this.dashboardService.getDashboardData(
      new Date(currentYear.getYear(), currentMonth.getMonth()),
      new Date(currentYear.getYear(), currentMonth.getMonth()+1)
    ).subscribe((dashboardData: DashboardDTO) => {
      this.sharedService.checkLoadingSpinner();
      this.increaseInExpense = dashboardData.increaseInExpense;
      this.increaseInIncome = dashboardData.increaseInIncome;
      this.totalIncome = dashboardData.incomes;
      this.totalSpendings = dashboardData.expenses;
      this.amountSpentAverage = dashboardData.averageDailyExpenses;
      this.dailyIncomeAverage = dashboardData.averageDailyIncome;
      this.expenseCategoriesData = dashboardData.expensesInfo;

      this.createDailyChart(
        dailyExpensesLabels, 
        this.getDailyExpensesData(dailyExpensesLabels, dashboardData.dailyExpenses)
      );

    }, (error: any) => {
      this.sharedService.checkLoadingSpinner();
      this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION)
    });
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
    let response = [];
    dailyExpensesLabels.forEach((label: string) => {
      const filtered: DailyExpenseDTO[] = dailyExpenses.filter((dailyExpenseDTO: DailyExpenseDTO) => dailyExpenseDTO._id === label);
      if(filtered.length !== 0) {
        response.push(filtered[0].dailyExpense);
      } else {
        response.push(0);
      }
    });
    return response;
  }

  calculateHeight(templateReference: HTMLElement): string {
    let clientHeight = templateReference.clientHeight;
    clientHeight +=126
    return `calc(100% - ${clientHeight}px)`;
  }

  onDateSelected(event: any): void {
    this.selectedDate = event.dateFrom;
    this.getDashboardData(event.dateFrom);
  }

  ngOnDestroy(): void {
    this.dashboardSubscription?.unsubscribe();
  }
}
