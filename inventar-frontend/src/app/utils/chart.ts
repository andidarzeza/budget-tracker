import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartOptions } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class ChartUtils {
    public createChart(context: string, options: ChartOptions): Chart {
        return new Chart(context, {
            type: options.type,
            data: {
                labels: options.labels,
                datasets: options.datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        display: options.showGridLines
                    },
                    x: {
                        display: options.showGridLines
                    }
                },
                plugins: {
                    legend: {
                        maxHeight: 50,
                        display: true,
                        position: 'bottom'
                    }
                },
                responsive: true,
                maintainAspectRatio: true
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
}