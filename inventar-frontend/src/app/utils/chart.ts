import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { RangeType } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ChartUtils {
  /** Active charts keyed by canvas element id, so we can update / resize / replace them. */
  private charts = new Map<string, Chart>();

  /** Extra series after the first (which uses the app's accent colour):
   *  iOS system blue, green, orange, purple, teal, indigo. */
  private readonly seriesPalette: string[] = [
    'rgb(0, 122, 255)',
    'rgb(52, 199, 89)',
    'rgb(255, 149, 0)',
    'rgb(175, 82, 222)',
    'rgb(48, 176, 199)',
    'rgb(88, 86, 214)',
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

  /**
   * Create / replace a line chart bound to the given canvas id. Styled like
   * the Exchange page: a smooth line in the accent colour over a soft
   * gradient, no dots until hovered, faint horizontal grid, no x grid, and
   * a legend only when several currencies share the chart.
   */
  createLineChart(canvasId: string): Chart {
    this.destroy(canvasId);
    const { grid, text } = this.themeColors();
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
            grid: { color: grid, drawBorder: false },
            ticks: { font: { size: 11 }, color: text, maxTicksLimit: 5 },
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { size: 11 }, color: text, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          },
        },
        plugins: {
          legend: {
            display: false,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 12,
              font: { size: 11 },
              color: text,
            },
          },
          tooltip: { mode: 'index', intersect: false, displayColors: false, cornerRadius: 10, padding: 10 },
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
        tension: 0.3,
        borderColor: color,
        // Vertical fade from the line colour to transparent, like Exchange.
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return this.alphaFill(color, 0.12);
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, this.alphaFill(color, 0.24));
          gradient.addColorStop(1, this.alphaFill(color, 0));
          return gradient;
        },
        fill: true,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
      };
    });
    const { grid, text } = this.themeColors();
    const options = chart.options as any;
    options.plugins.legend.display = series.length > 1;
    options.plugins.tooltip.displayColors = series.length > 1;
    options.plugins.legend.labels.color = text;
    options.scales.x.ticks.color = text;
    options.scales.y.ticks.color = text;
    options.scales.y.grid.color = grid;
    chart.update();
  }

  /** First series: the app's accent (red, or pink in the pink theme). */
  private colorForIndex(index: number): string {
    if (index === 0) return this.toRgb(this.cssVar('--app-accent', '#ff3b30'));
    return this.seriesPalette[(index - 1) % this.seriesPalette.length];
  }

  private themeColors(): { grid: string; text: string } {
    return {
      grid: this.cssVar('--app-border', 'rgba(60, 60, 67, 0.18)'),
      text: this.cssVar('--app-text-subtle', '#8e8e93'),
    };
  }

  private cssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
  }

  /** `#rrggbb` → `rgb(r, g, b)` so `alphaFill` can derive translucent fills. */
  private toRgb(color: string): string {
    const hex = color.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
    const n = parseInt(hex, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
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
