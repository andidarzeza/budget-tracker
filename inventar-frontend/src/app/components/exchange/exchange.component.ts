import { DatePipe, DecimalPipe } from '@angular/common';
import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef,
  inject, OnDestroy, OnInit, signal, untracked, viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ExchangeRate, ExchangeRateService } from 'src/app/services/pages/exchange-rate.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';

type ChartRange = 'daily' | 'monthly' | 'yearly';

interface ChartPoint { label: string; value: number; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** EUR ↔ ALL converter and rate chart, using the daily Iliria98 sell rate stored by the backend. */
@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, DecimalPipe, DatePipe],
})
export class ExchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly exchangeRateService = inject(ExchangeRateService);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly themeService = inject(ThemeService);
  private readonly toastr = inject(ToastrService);

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('rateChart');
  private chart?: Chart<'line'>;

  readonly rates = signal<ExchangeRate[]>([]);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly range = signal<ChartRange>('daily');

  readonly ranges: { value: ChartRange; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  readonly latest = computed(() => this.rates().at(-1) ?? null);
  readonly previous = computed(() => this.rates().at(-2) ?? null);
  readonly rate = computed(() => this.latest()?.sell ?? 0);

  /** Change of the sell rate against the previous stored day. */
  readonly change = computed(() => {
    const now = this.latest(), before = this.previous();
    return now && before ? now.sell - before.sell : null;
  });

  /** Converter inputs — typing into one recomputes the other at the current sell rate. */
  readonly lek = signal<number | null>(null);
  readonly euro = signal<number | null>(1);
  private lastEdited: 'lek' | 'euro' = 'euro';

  readonly points = computed<ChartPoint[]>(() => this.buildPoints(this.rates(), this.range()));

  readonly stats = computed(() => {
    const values = this.points().map(p => p.value);
    if (!values.length) return null;
    return { min: Math.min(...values), max: Math.max(...values), count: values.length };
  });

  constructor() {
    // Keep the converted side in sync when the rate first loads or is refreshed.
    effect(() => {
      const rate = this.rate();
      if (!rate) return;
      untracked(() => {
        if (this.lastEdited === 'euro') this.lek.set(this.round(this.euroValue() * rate));
        else this.euro.set(this.round(this.lekValue() / rate));
      });
    });
    effect(() => {
      const points = this.points();
      this.themeService.theme();
      if (this.chart) this.renderChart(points);
    });
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.load();
  }

  ngAfterViewInit(): void {
    Chart.register(...registerables);
    const el = this.canvas()?.nativeElement;
    if (!el) return;
    this.chart = new Chart(el, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: { label: ctx => `1 EUR = ${(ctx.parsed.y ?? 0).toFixed(2)} ALL` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
          y: { ticks: { font: { size: 11 }, callback: v => Number(v).toFixed(1) } },
        },
      },
    });
    this.renderChart(this.points());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private load(): void {
    this.loading.set(true);
    this.exchangeRateService.history('EUR').subscribe({
      next: rates => { this.rates.set(rates); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.error('Could not load exchange rates'); },
    });
  }

  refresh(): void {
    this.refreshing.set(true);
    this.exchangeRateService.refresh('EUR').subscribe({
      next: rate => {
        this.rates.update(list => [...list.filter(r => r.date !== rate.date), rate].sort((a, b) => a.date.localeCompare(b.date)));
        this.refreshing.set(false);
        this.toastr.success(`Rate updated: 1 EUR = ${rate.sell} ALL`);
      },
      error: () => { this.refreshing.set(false); this.toastr.error('Could not reach Iliria98'); },
    });
  }

  onLekInput(value: string): void {
    this.lastEdited = 'lek';
    const lek = this.parse(value);
    this.lek.set(lek);
    this.euro.set(lek === null || !this.rate() ? null : this.round(lek / this.rate()));
  }

  onEuroInput(value: string): void {
    this.lastEdited = 'euro';
    const euro = this.parse(value);
    this.euro.set(euro);
    this.lek.set(euro === null || !this.rate() ? null : this.round(euro * this.rate()));
  }

  /** Quick amounts for the euro side. */
  setEuro(amount: number): void {
    this.onEuroInput(String(amount));
  }

  private lekValue(): number { return this.lek() ?? 0; }
  private euroValue(): number { return this.euro() ?? 0; }

  private parse(value: string): number | null {
    const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  /** Daily = last 30 stored days; monthly / yearly = average of the stored days in each bucket. */
  private buildPoints(rates: ExchangeRate[], range: ChartRange): ChartPoint[] {
    if (range === 'daily') {
      return rates.slice(-30).map(r => {
        const [, m, d] = r.date.split('-');
        return { label: `${+d} ${MONTHS[+m - 1]}`, value: r.sell };
      });
    }
    const keyOf = (date: string) => range === 'monthly' ? date.slice(0, 7) : date.slice(0, 4);
    const buckets = new Map<string, number[]>();
    for (const r of rates) {
      const key = keyOf(r.date);
      buckets.set(key, [...(buckets.get(key) ?? []), r.sell]);
    }
    const entries = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
    const limited = range === 'monthly' ? entries.slice(-12) : entries;
    return limited.map(([key, values]) => ({
      label: range === 'monthly' ? `${MONTHS[+key.slice(5, 7) - 1]} ${key.slice(0, 4)}` : key,
      value: values.reduce((s, v) => s + v, 0) / values.length,
    }));
  }

  private renderChart(points: ChartPoint[]): void {
    if (!this.chart) return;
    const css = getComputedStyle(document.body);
    const accent = css.getPropertyValue('--app-accent').trim() || '#e5383b';
    const text = css.getPropertyValue('--app-text-subtle').trim() || '#9898a3';
    const grid = css.getPropertyValue('--app-border').trim() || '#e9e9ec';

    const ctx = this.chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.chart.height || 300);
    gradient.addColorStop(0, this.withAlpha(accent, 0.22));
    gradient.addColorStop(1, this.withAlpha(accent, 0));

    this.chart.data.labels = points.map(p => p.label);
    this.chart.data.datasets = [{
      data: points.map(p => p.value),
      borderColor: accent,
      backgroundColor: gradient,
      fill: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: points.length <= 31 ? 3 : 0,
      pointHoverRadius: 5,
      pointBackgroundColor: accent,
    }];
    const scales = this.chart.options.scales as any;
    scales.x.ticks.color = text;
    scales.y.ticks.color = text;
    scales.y.grid = { color: grid };
    // Give a single point (or a flat line) some breathing room instead of a 0..max axis.
    const values = points.map(p => p.value);
    const min = Math.min(...values), max = Math.max(...values);
    const pad = values.length ? Math.max((max - min) * 0.2, 0.5) : 0;
    scales.y.suggestedMin = values.length ? min - pad : undefined;
    scales.y.suggestedMax = values.length ? max + pad : undefined;
    this.chart.update();
  }

  private withAlpha(color: string, alpha: number): string {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return color;
    const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
