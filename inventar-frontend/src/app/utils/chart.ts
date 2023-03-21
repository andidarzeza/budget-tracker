import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartOptions } from '../models/models';
import { ThemeService } from '../services/theme.service';

@Injectable({
    providedIn: 'root'
})
export class ChartUtils {
    constructor() { }

    public createChart(context: string): Chart {
        const color = localStorage.getItem("themeColor");
        const chartBackgoundColor = this.getChartBackgroundColor(color);
        return new Chart(context, {
            type: "line",
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                datasets: [{
                    data: [10, 20, 30, 10, 20, 25, 30, 35, 40, 22, 23, 10],
                    tension: .4,
                    backgroundColor: chartBackgoundColor,
                    borderColor: color,
                    fill: true
                }],
            },
            options: {
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
}