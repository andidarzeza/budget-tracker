import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { DateUtil } from 'src/app/utils/DateUtil';
import { SharedService } from 'src/app/services/shared.service';
import { strToColor } from 'src/app/utils/ColorUtil';
import { animate, style, transition, trigger } from '@angular/animations';

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
export class DashboardComponent implements OnInit {
  selectedDate = new Date();
  currentMonth = this.selectedDate.getMonth();
  chart1Loaded = false;
  chart2Loaded = false;
  totalSpendings: any;
  constructor(public dashboardService: DashboardService, public chartUtil: ChartUtils, public sharedService: SharedService) { }

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

    this.dashboardService.getCategoriesata().subscribe((response: any) => {
      const spendingResponse = response.body;
      this.totalSpendings = spendingResponse.reduce((previousValue, currentValue) => previousValue?.total + currentValue?.total)
      this.chartUtil.createChart("category-chart", {
        type: 'doughnut',
        labels: spendingResponse.map(item => item._id),
        showGridLines: false,
        datasets: [{
          label: 'Categories',
          data: spendingResponse.map(item => item.total * 100 / (this.totalSpendings?.total??this.totalSpendings)),
          tension: 0.2,
          backgroundColor: ['rgb(90,183,138)', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)']
          // response.body.map(item => '#' + strToColor(item._id))
          ,
          borderColor: ['rgb(90,183,138)', 'rgb(73,97,206)', 'rgb(81,190,202)', '#ff6347', 'rgb(158,127,255)']
          // response.body.map(item => '#' + strToColor(item._id))
          ,
          borderWidth: 1
        }]
      });
      this.chart2Loaded = true;
    })
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
