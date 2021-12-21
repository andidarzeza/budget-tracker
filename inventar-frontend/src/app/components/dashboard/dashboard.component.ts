import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, Day, Month, MonthValue, Year } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { strToColor } from 'src/app/utils/ColorUtil';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';

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
  chart1Loaded = false;
  chart2Loaded = false;
  chart3Loaded = false;
  totalSpendings: number = 0;
  totalIncome: number = 0;
  amountSpentAverage: number = 0;
  dailySpendingsSubscription: Subscription = null;
  categoriesDataSubscription: Subscription = null;
  incomeCategoriesSubscription: Subscription = null;
  constructor(public dashboardService: DashboardService, public chartUtil: ChartUtils, public sharedService: SharedService) { }

  ngOnInit(): void {
    Chart.register(...registerables);
  }

  // fires only from onDateSelected function below
  private getDailySpendings(dateFrom: Date, dateTo: Date): void {
    const currentYear = this.dateUtil.fromYear(dateFrom.getFullYear());
    const currentMonth = currentYear.getMonthByValue(dateFrom.getMonth());
    const days = currentMonth.getDaysOfMonth();
    let labels = [];
    const chartLabels = this.getMonthlyLabels(days, currentYear, currentMonth);
    if(currentMonth.getMonth() === this.currentMonth) {
      labels = chartLabels.filter(label => +(label.split("-")[0]) <= this.selectedDate.getDate());
    } else {
      labels = chartLabels;
    }
    this.unsubscribe(this.dailySpendingsSubscription);
    this.dailySpendingsSubscription = this.dashboardService.getDailyExpenses().subscribe((response: any) => {
      this.amountSpentAverage = this.sum(response.body) / response.body.length;
      const data: number[] = this.fillMissingData(response.body, chartLabels);
      this.chartUtil.createChart("daily-chart", {
        type: 'line',
        colors: ['#ff6347'],
        labels: labels,
        showGridLines: true,
        datasets: [{
          label: 'Money Spent',
          data: data,
          tension: 0.2,
          backgroundColor: ['#ff6347'],
          borderColor: ['#ff6347'],
          borderWidth: 1
        }]
      });
      this.chart1Loaded = true;
    });
  }

  // fires only from onDateSelected function below
  private getCategoriesData(): void {  
    this.unsubscribe(this.categoriesDataSubscription);  
    this.categoriesDataSubscription = this.dashboardService.getCategoriesData().subscribe((response: any) => {
      const spendingResponse = response.body;
      this.totalSpendings = this.sum(spendingResponse)
      this.chartUtil.createChart("category-chart", {
        type: 'doughnut',
        labels: spendingResponse.map(item => item._id),
        showGridLines: false,
        datasets: [{
          label: 'Categories',
          data: spendingResponse.map(item => item.total * 100 / (this.totalSpendings)),
          tension: 0.2,
          backgroundColor: ['#ff6347', 'rgb(90,183,138)', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)'],
          borderColor: ['#ff6347', 'rgb(90,183,138)', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)'],
          borderWidth: 1
        }]
      });
      this.chart2Loaded = true;
    });
  }

  getIncomesCategoryData(): void {
    this.unsubscribe(this.incomeCategoriesSubscription); 
    this.incomeCategoriesSubscription = this.dashboardService.getIncomeCategoriesData().subscribe((response: any) => {
      const incomeResponse = response.body;
      this.totalIncome = this.sum(incomeResponse)
      this.chartUtil.createChart("incomes-chart", {
        type: 'doughnut',
        labels: incomeResponse.map(item => item._id),
        showGridLines: false,
        datasets: [{
          label: 'Incomes',
          data: incomeResponse.map(item => item.total),
          tension: 0.2,
          backgroundColor: ['#305680', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)'],
          borderColor: ['#305680', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)'],
          borderWidth: 1
        }]
      });
      this.chart3Loaded = true;
    });
  }

  private fillMissingData(data: any, chartLabels: string[]): number[] {
    const response = []
    for(let i = 0;i<chartLabels.length;i++) {
      const chartLabel = chartLabels[i];
      const index = this.contains(data, chartLabel);
      if(index > -1) {
        response.push(data[index].total);
      } else {
        response.push(0);
      }
    }
    return response;
  }

  private contains(array: any[], value: any): number {
    let index = -1;
    for(let i = 0;i<array.length;i++) {
      if(array[i]._id === value) {
        index = i;
      }
    }
    return index;
  }

  private sum(array: any[]): number {
    let sum = 0;
    array.forEach(num => {
      sum+=num?.total;
    });
    return sum;
  }

  onDateSelected(event: any): void {
    this.getDailySpendings(event.dateFrom, event.dateTo);
    this.getCategoriesData();
    this.getIncomesCategoryData();
  }

  private getMonthlyLabels(days: Day[], currentYear: Year, currentMonth: Month): string[] {
    return days.map(day => day?.getDayNumber().toString() + "-" + (currentMonth.getMonth() + 1).toString() + "-" + currentYear.getYear().toString());
  }

  private unsubscribe(subscription: Subscription): void {
    if(subscription) {
      subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe(this.incomeCategoriesSubscription);
    this.unsubscribe(this.dailySpendingsSubscription);
    this.unsubscribe(this.categoriesDataSubscription);
  }

}
