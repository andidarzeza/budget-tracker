import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { RangeType } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ChartUtils {
  /** Active charts keyed by canvas element id, so we can update / resize / replace them. */
  private charts = new Map<string, Chart>();

  private readonly seriesPalette: string[] = [
    'rgb(37, 99, 235)',
    'rgb(220, 38, 38)',
    'rgb(5, 150, 105)',
    'rgb(217, 119, 6)',
    'rgb(124, 58, 237)',
    'rgb(219, 39, 119)',
    'rgb(8, 145, 178)',
    'rgb(101, 163, 13)',
    'rgb(244, 114, 182)',
    'rgb(99, 102, 241)',
  ];

  private readonly hourLabels: string[] = Array.from(
    { length: 24 },
    (_, h) => `${String(h).padStart(2, '0')}:00`,
  );
  private readonly weekdayLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly monthLabels: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  /** Create / replace a line chart bound to the given canvas id. */
  createLineChart(canvasId: string): Chart {
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
            ticks: { font: { size: 11 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 12,
              font: { size: 11 },
            },
          },
          tooltip: { mode: 'index', intersect: false },
        },
      },
    };
    const chart = new Chart(canvasId, config) as Chart;
    this.charts.set(canvasId, chart);
    return chart;
  }

  resizeDashboardCharts(): void {
    requestAnimationFrame(() => {
      this.charts.forEach((c) => c.resize());
    });
  }

  /** Set the X-axis labels of a line chart based on the active range bucket. */
  updateTimelineLabels(
    canvasId: string,
    range: RangeType,
    selectedTimeline: { year: number; month: number; from?: Date; to?: Date },
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
        labels = Array.from(
          { length: this.daysInMonth(selectedTimeline.year, selectedTimeline.month) },
          (_, i) => i + 1,
        );
        break;
      case 'YEAR':
        labels = this.monthLabels;
        break;
      case 'CUSTOM':
        labels = this.customDayLabels(selectedTimeline.from, selectedTimeline.to);
        break;
      case 'MAX':
      default:
        labels = [];
    }
    chart.data.labels = labels;
    chart.update();
  }

  /** Override the X-axis labels directly. Used by the MAX range, where the
   *  label set depends on what years appear in the data, not the range
   *  alone — see the MAX branch in `dashboard.updateLineSeries`. */
  setLineLabels(canvasId: string, labels: (string | number)[]): void {
    const chart = this.charts.get(canvasId);
    if (!chart) return;
    chart.data.labels = labels;
    chart.update();
  }

  /**
   * "MMM d" labels for every day in `[from, to)` — `to` is exclusive (matches
   * the convention used by every dashboard picker, where `to` is the start of
   * the day after the last included day).
   */
  private customDayLabels(from?: Date, to?: Date): string[] {
    if (!from || !to) return [];
    const out: string[] = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cursor < end) {
      out.push(
        `${this.monthLabels[cursor.getMonth()]} ${cursor.getDate()}`,
      );
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }

  /** One line per series (typically per currency). Replaces all line datasets. */
  updateLineSeries(
    canvasId: string,
    series: { label: string; data: number[]; colorIndex?: number }[],
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

  private colorForIndex(index: number): string {
    return this.seriesPalette[index % this.seriesPalette.length];
  }

  /** Translucent fill derived from a solid `rgb(...)` palette color. */
  private alphaFill(color: string, alpha = 0.18): string {
    const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (!m) return color;
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
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
