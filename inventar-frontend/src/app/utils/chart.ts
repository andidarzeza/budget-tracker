import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartOptions } from './ChartOptions';

@Injectable({
    providedIn: 'root'
})
export class ChartUtils {
    public createChart(context: string, options: ChartOptions): Chart {
        return new Chart(context, {
            type: 'line',
            data: {
                labels: options.labels,
                datasets: [{
                    label: 'Money Spent',
                    data: options.data,
                    tension: 0.2,
                    backgroundColor: 
                        '#ff6347'
                    ,
                    borderColor: 
                        '#ff6347',
                    
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });;
    }
}