import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { strToColor } from 'src/app/utils/ColorUtil';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { FloatingMenuConfig } from 'src/app/shared/floating-menu/FloatingMenuConfig';
import { ExportService } from 'src/app/services/export.service';
import { DailyExpenseDTO, DashboardDTO, ExpenseInfoDTO, IncomeInfoDTO } from 'src/app/models/DashboardModels';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedDate = new Date();
  dateUtil = new DateUtil();
  currentMonth = this.selectedDate.getMonth();
  private totalRequests = 0;

  totalSpendings: number = 0;
  totalIncome: number = 0;
  amountSpentAverage: number = 0;
  dailyIncomeAverage: number = 0;
  dashboardSubscription: Subscription = null;
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
          ).subscribe((pdfDocument: Blob) => {
            this.exportToPDF(pdfDocument);
          })
        }
      }
    ]
  };

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    public sharedService: SharedService,
    public exportService: ExportService
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
  }

  // fires only from onDateSelected function below
  private getDashboardData(dateFrom: Date): void {
    this.dashboardSubscription?.unsubscribe();

    const currentYear = this.dateUtil.fromYear(dateFrom.getFullYear());
    const currentMonth = currentYear.getMonthByValue(dateFrom.getMonth());
    const days = currentMonth.getDaysOfMonth();

    let dailyExpensesLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    
    this.sharedService.activateLoadingSpinner();
    this.totalRequests++;

    this.dashboardSubscription = this.dashboardService.getDashboardData(
      new Date(currentYear.getYear(), currentMonth.getMonth()),
      new Date(currentYear.getYear(), currentMonth.getMonth()+1)
    ).subscribe((dashboardData: DashboardDTO) => {
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);

      this.totalIncome = dashboardData.incomes;
      this.totalSpendings = dashboardData.expenses;
      this.amountSpentAverage = dashboardData.averageDailyExpenses;
      this.dailyIncomeAverage = dashboardData.averageDailyIncome;
      

      this.createDailyChart(
        dailyExpensesLabels, 
        this.getDailyExpensesData(dailyExpensesLabels, dashboardData.dailyExpenses)
      );
      
      this.createCategoryChart(
        dashboardData.expensesInfo.map((expenseInfo: ExpenseInfoDTO) => expenseInfo._id),
        dashboardData.expensesInfo.map((expenseInfo: ExpenseInfoDTO) => expenseInfo.total),
      );

      this.createIncomesChart(
        dashboardData.incomesInfo.map((incomeInfo: IncomeInfoDTO) => incomeInfo._id),
        dashboardData.incomesInfo.map((incomeInfo: IncomeInfoDTO) => incomeInfo.total),
      );

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

  // currentMonth.getMonth()

  private createDailyChart(labels: string[], data: number[]): void {
    if(this.chart) {
      this.chart.destroy();
    }
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
        tension: 0.2,
        backgroundColor: ['#ff6347'],
        borderColor: ['#ff6347'],
        borderWidth: 1
      }]
    });
  }

  private createCategoryChart(labels: string[], data: number[]): void {
    if(this.category_chart) {
      this.category_chart.destroy();
    }
    this.category_chart = this.chartUtil.createChart("category-chart", {
      type: 'doughnut',
      labels,
      showGridLines: false,
      datasets: [{
        label: 'Categories',
        data,
        tension: 0.2,
        backgroundColor: labels.map(label => strToColor(label)),
        borderColor: labels.map(label => strToColor(label)),
        borderWidth: 1
      }]
    });
  }

  private createIncomesChart(labels: string[], data: number[]): void {
    if(this.incomes_chart) {
      this.incomes_chart.destroy();
    }
    this.incomes_chart = this.chartUtil.createChart("incomes-chart", {
      type: 'doughnut',
      labels,
      showGridLines: false,
      datasets: [{
        label: 'Incomes',
        data,
        tension: 0.2,
        backgroundColor: labels.map(label => strToColor(label)),
        borderColor: labels.map(label => strToColor(label)),
        borderWidth: 1
      }]
    });
  }

  getDailyExpensesData(dailyExpensesLabels: string[], dailyExpenses: DailyExpenseDTO[]): number[] {
    console.log(dailyExpensesLabels);
    console.log(dailyExpenses);
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
