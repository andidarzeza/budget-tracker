import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { RangeType } from '../models/models';

export interface DoughnutDataPoint {
  label: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartUtils {

  /** Active charts keyed by canvas element id, so we can update / resize / replace them. */
  private charts = new Map<string, Chart>();

  private readonly seriesPalette: string[] = [
    'rgb(37, 99, 235)',   // blue
    'rgb(220, 38, 38)',   // red
    'rgb(5, 150, 105)',   // green
    'rgb(217, 119, 6)',   // amber
    'rgb(124, 58, 237)',  // violet
    'rgb(219, 39, 119)',  // pink
    'rgb(8, 145, 178)',   // cyan
    'rgb(101, 163, 13)',  // lime
    'rgb(244, 114, 182)', // rose
    'rgb(99, 102, 241)',  // indigo
  ];

  private readonly hourLabels: string[] = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
  private readonly weekdayLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly monthLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor() { }

  public colorForIndex(index: number): string {
    return this.seriesPalette[index % this.seriesPalette.length];
  }

  /** @deprecated kept for callers that haven't migrated to {@link colorForIndex}. */
  public lineColorForDatasetIndex(index: number): string {
    return this.colorForIndex(index);
  }

  /** Translucent fill derived from a solid `rgb(...)` palette color. */
  private alphaFill(color: string, alpha = 0.18): string {
    const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (!m) return color;
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
  }

  /** Create / replace a line chart bound to the given canvas id. */
  public createLineChart(canvasId: string): Chart {
    this.destroy(canvasId);
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: {
            min: 0,
            grid: { color: 'rgba(148, 163, 184, 0.18)' },
            ticks: { font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 12,
              font: { size: 11 }
            }
          },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    };
    const chart = new Chart(canvasId, config) as Chart;
    this.charts.set(canvasId, chart);
    return chart;
  }

  /** @deprecated kept for backwards compat. Prefer {@link createLineChart}. */
  public createChart(canvasId: string): Chart {
    return this.createLineChart(canvasId);
  }

  /** Create / replace a doughnut chart. Real data is fed in later via {@link setDoughnutData}. */
  public createDoughnutChart(canvasId: string): Chart {
    this.destroy(canvasId);
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const raw = Number(ctx.parsed) || 0;
                const ds = ctx.dataset.data as number[];
                const total = ds.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                const pct = ((raw / total) * 100).toFixed(1);
                return `${ctx.label}: ${raw.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${pct}%)`;
              }
            }
          }
        }
      }
    };
    const chart = new Chart(canvasId, config) as Chart;
    this.charts.set(canvasId, chart);
    return chart;
  }

  /** Push real data into a previously-created doughnut. Callers may pass [] to clear. */
  public setDoughnutData(canvasId: string, points: DoughnutDataPoint[]): void {
    const chart = this.charts.get(canvasId);
    if (!chart) {
      return;
    }
    const labels = points.map(p => p.label);
    const data = points.map(p => p.value);
    const colors = points.map((_, i) => this.colorForIndex(i));

    chart.data.labels = labels;
    chart.data.datasets = [{
      data,
      backgroundColor: colors,
      borderRadius: 6,
      borderColor: 'transparent',
      spacing: 1,
    } as any];
    chart.update();
  }

  public resizeDashboardCharts(): void {
    requestAnimationFrame(() => {
      this.charts.forEach(c => c.resize());
    });
  }

  /** Set the X-axis labels of a line chart based on the active range bucket. */
  public updateTimelineLabels(
    canvasId: string,
    range: RangeType,
    selectedTimeline: { year: number; month: number }
  ): void {
    const chart = this.charts.get(canvasId);
    if (!chart) return;
    let labels: (string | number)[] = [];
    switch (range) {
      case 'DAY':
        labels = this.hourLabels;
        break;
      case 'WEEK':
        labels = this.weekdayLabels;
        break;
      case 'MONTH':
        labels = Array.from({ length: this.daysInMonth(selectedTimeline.year, selectedTimeline.month) }, (_, i) => i + 1);
        break;
      case 'YEAR':
        labels = this.monthLabels;
        break;
      case 'MAX':
      default:
        labels = [];
    }
    chart.data.labels = labels;
    chart.update();
  }

  /** One line per series (typically per currency). Replaces all line datasets. */
  public updateLineSeries(
    canvasId: string,
    series: { label: string; data: number[]; colorIndex?: number }[]
  ): void {
    const chart = this.charts.get(canvasId);
    if (!chart) return;
    chart.data.datasets = series.map((s, i) => {
      const idx = s.colorIndex ?? i;
      const color = this.colorForIndex(idx);
      return {
        label: s.label,
        data: s.data,
        tension: 0.35,
        borderColor: color,
        backgroundColor: this.alphaFill(color, 0.2),
        fill: true,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      };
    });
    chart.update();
  }

  /** @deprecated Routes to the line chart created at id `line-chart`. Kept for legacy callers. */
  public updateTimelineDataByCurrency(
    datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[]
  ): void {
    this.updateLineSeries('line-chart', datasets.map(d => ({ label: d.label, data: d.data })));
  }

  private daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  private destroy(canvasId: string): void {
    const existing = this.charts.get(canvasId);
    if (existing) {
      existing.destroy();
      this.charts.delete(canvasId);
    }
  }
}
