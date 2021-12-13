import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AccountService } from 'src/app/services/account.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil, MonthValue } from 'src/app/utils/DateUtil';
import { pipe, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedDate = new Date();
  currentMonth = this.selectedDate.getMonth();
  constructor(public dashboardService: DashboardService, public chartUtil: ChartUtils) { }

  ngOnInit(): void {
    Chart.register(...registerables);
    const dateUtil = new DateUtil();
    const currentYear = dateUtil.fromYear(this.selectedDate.getFullYear());
    const currentMonth = currentYear.getMonthByValue(this.selectedDate.getMonth());
    const days = currentMonth.getDaysOfMonth();    
    let labels = [];
    const chartLabels = days.map(day => day?.getDayNumber().toString() + "-" + (currentMonth.getMonth() + 1).toString() + "-" + currentYear.getYear().toString());
    if(currentMonth.getMonth() === this.currentMonth) {
      labels = chartLabels.filter(label => +(label.split("-")[0]) <= this.selectedDate.getDate());
    } else {
      labels = chartLabels;
    }    
    this.dashboardService.getDailySpendings().subscribe((response: any) => {
      console.log(response.body);
      const data: number[] = this.fillMissingData(response.body, chartLabels);
      this.chartUtil.createChart("daily-chart", {
        labels: labels,
        data: data
      });
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

}
