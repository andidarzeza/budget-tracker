import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartOptions, RangeType } from '../models/models';
import { ThemeService } from '../services/theme.service';

@Injectable({
    providedIn: 'root'
})
export class ChartUtils {

    private lineChart: Chart;
    private hourLabels: string[] =[
        "00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00",
        "12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"
    ];
    private yearLabels: string[] = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    constructor() { }

    public createChart(context: string): void {
        const color = localStorage.getItem("themeColor");
        const chartBackgoundColor = this.getChartBackgroundColor(color);
        this.lineChart = new Chart(context, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    tension: .4,
                    backgroundColor: chartBackgoundColor,
                    borderColor: color,
                    fill: true
                }],
            },
            options: {
                scales: {
                    y: {
                        min: 0
                    }
                },
                plugins: {
                     legend: {
                         display: false
                    }
                }
            }
        });
    }

    public createDoughnutChart(context: string): Chart {
        return new Chart(context, {
            type: 'doughnut',
            data: {
                labels: ['Red', 'Blue', 'Yellow'],
                datasets: [{
                  label: 'My First Dataset',
                  data: [300, 50, 100],
                  backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                  ],
                  borderRadius: 10,
                  borderColor: 'transparent',
                  spacing: 1
                }]
            },
            options: {
                cutout: 60,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    private getChartBackgroundColor(color: string): string {
        return color.substring(0, color.length - 2) + '0.3)';
    }

    public updateTimelineLabels(range: RangeType, type: "doughnut" | "line", selectedTimeline: {year: number, month: number}): void {
        if(type == "line") {
            switch(range) {
                case 'DAY':
                    this.lineChart.data.labels = this.hourLabels;
                    break;
                case 'MONTH':
                    // needs current selected month do get the days
                    this.lineChart.data.labels = Array.from(Array(this.getDaysInMonth(selectedTimeline.year, selectedTimeline.month)).keys()).map(x => x + 1);
                    break;
                case 'YEAR':
                    this.lineChart.data.labels = this.yearLabels;
                    break;
            }
            
            this.lineChart.update();
        }
    }

    public updateTimelineData(data: number[]): void {
        this.lineChart.data.datasets[0].data = data;
        this.lineChart.update();
    }

    private getDaysInMonth(year: number, month): number {
        return new Date(year, month, 0).getDate();
    }
}