import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { RangeType } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ChartUtils {

  private lineChart!: Chart;
  private doughnutChart!: Chart;
  private readonly lineDatasetColors = [
    'rgb(37, 99, 235)',
    'rgb(220, 38, 38)',
    'rgb(5, 150, 105)',
    'rgb(217, 119, 6)',
    'rgb(124, 58, 237)',
    'rgb(219, 39, 119)',
    'rgb(8, 145, 178)',
    'rgb(101, 163, 13)',
  ];
  private hourLabels: string[] = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  private yearLabels: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  constructor() { }

  public lineColorForDatasetIndex(index: number): string {
    return this.lineDatasetColors[index % this.lineDatasetColors.length];
  }

  public createChart(context: string): void {
    this.lineChart = new Chart(context, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            min: 0
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        }
      }
    });
  }

  public createDoughnutChart(context: string): Chart {
    this.doughnutChart = new Chart(context, {
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
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: 60,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }) as Chart;
    return this.doughnutChart;
  }

  public resizeDashboardCharts(): void {
    requestAnimationFrame(() => {
      this.lineChart?.resize();
      this.doughnutChart?.resize();
    });
  }

  private getChartBackgroundColor(color: string | null): string {
    if (!color || color.length < 4) {
      return 'rgba(59, 130, 246, 0.2)';
    }
    return color.substring(0, color.length - 2) + '0.3)';
  }

  public updateTimelineLabels(range: RangeType, type: 'doughnut' | 'line', selectedTimeline: { year: number, month: number }): void {
    if (type === 'line') {
      switch (range) {
        case 'DAY':
          this.lineChart.data.labels = this.hourLabels;
          break;
        case 'MONTH':
          this.lineChart.data.labels = Array.from(Array(this.getDaysInMonth(selectedTimeline.year, selectedTimeline.month)).keys()).map(x => x + 1);
          break;
        case 'YEAR':
          this.lineChart.data.labels = this.yearLabels;
          break;
        default:
          break;
      }

      this.lineChart.update();
    }
  }

  /**
   * One line per currency (or other series). Replaces all line datasets.
   */
  public updateTimelineDataByCurrency(
    datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[]
  ): void {
    this.lineChart.data.datasets = datasets.map(d => ({
      label: d.label,
      data: d.data,
      tension: 0.35,
      borderColor: d.borderColor,
      backgroundColor: d.backgroundColor,
      fill: false,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 5,
    }));
    this.lineChart.update();
  }

  /** @deprecated Prefer {@link updateTimelineDataByCurrency} for expense timelines. */
  public updateTimelineData(data: number[]): void {
    const color = localStorage.getItem('themeColor') || 'rgb(59, 130, 246)';
    const chartBackgoundColor = this.getChartBackgroundColor(color);
    this.updateTimelineDataByCurrency([{
      label: 'Total',
      data,
      borderColor: color,
      backgroundColor: chartBackgoundColor,
    }]);
  }

  private getDaysInMonth(year: number, month): number {
    return new Date(year, month, 0).getDate();
  }
}
