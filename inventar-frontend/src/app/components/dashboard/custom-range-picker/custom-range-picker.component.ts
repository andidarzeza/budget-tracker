import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from 'src/app/services/breakpoint.service';

const MAX_GAP_DAYS = 31;
const STORAGE_KEY = 'dashboard.customRange';

@Component({
  selector: 'custom-range-picker',
  templateUrl: './custom-range-picker.component.html',
  styleUrls: ['./custom-range-picker.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
  ],
})
export class CustomRangePickerComponent implements OnInit {
  private readonly breakpointService = inject(BreakpointService);

  /** Inclusive start of the user's selected window (local midnight). */
  readonly start = signal<Date>(this.shiftDays(new Date(), -6));
  /** Inclusive end of the user's selected window (local midnight). */
  readonly end = signal<Date>(this.startOfDay(new Date()));

  constructor() {
    this.restorePersistedWindow();
  }

  /** Mobile gets the centred fullscreen Material picker; desktop the dropdown. */
  readonly touchUi = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

  ngOnInit(): void {
    this.emitDateRange();
  }

  /**
   * Pick a new start date. We never clamp the existing end — instead, if the
   * gap would exceed the limit, we shift `end` forward to keep the window
   * within `MAX_GAP_DAYS`. Same idea on the end side. This way the user
   * doesn't lose context: the bound they just touched stays put.
   */
  onStartPicked(date: Date | null): void {
    if (!date) return;
    const next = this.startOfDay(date);
    let end = this.end();
    if (next > end) {
      end = next;
    }
    if (this.diffInDays(next, end) > MAX_GAP_DAYS) {
      end = this.shiftDays(next, MAX_GAP_DAYS);
    }
    this.start.set(next);
    this.end.set(end);
    this.emitDateRange();
  }

  onEndPicked(date: Date | null): void {
    if (!date) return;
    const next = this.startOfDay(date);
    let start = this.start();
    if (next < start) {
      start = next;
    }
    if (this.diffInDays(start, next) > MAX_GAP_DAYS) {
      start = this.shiftDays(next, -MAX_GAP_DAYS);
    }
    this.start.set(start);
    this.end.set(next);
    this.emitDateRange();
  }

  /** Earliest date the *end* picker can show: `start`. */
  get endMin(): Date {
    return this.start();
  }

  /** Latest date the *end* picker can show: `start + MAX_GAP_DAYS`. */
  get endMax(): Date {
    return this.shiftDays(this.start(), MAX_GAP_DAYS);
  }

  /** Latest date the *start* picker can show: `end`. */
  get startMax(): Date {
    return this.end();
  }

  /** Earliest date the *start* picker can show: `end − MAX_GAP_DAYS`. */
  get startMin(): Date {
    return this.shiftDays(this.end(), -MAX_GAP_DAYS);
  }

  private emitDateRange(): void {
    // Match the convention used by the other dashboard pickers:
    // `to` is exclusive (start of the day after `end`), so backend `< to`
    // queries cover the full last day inclusively.
    this.onChange.emit({
      from: this.start(),
      to: this.shiftDays(this.end(), 1),
    });
    this.persistWindow();
  }

  /**
   * Persist the inclusive `[start, end]` window so the user lands back on
   * the same dates next visit. We store calendar dates (yyyy-MM-dd) rather
   * than timestamps so a window picked in one timezone re-opens on the same
   * calendar days everywhere.
   */
  private persistWindow(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          start: this.toIsoDate(this.start()),
          end: this.toIsoDate(this.end()),
        }),
      );
    } catch {
      /* storage full / disabled — fall back silently to in-memory only. */
    }
  }

  /** Hydrate `start`/`end` from localStorage, clamping to the 31-day rule. */
  private restorePersistedWindow(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let parsed: { start?: string; end?: string } | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const start = this.parseIsoDate(parsed?.start);
    const end = this.parseIsoDate(parsed?.end);
    if (!start || !end || start > end) return;
    if (this.diffInDays(start, end) > MAX_GAP_DAYS) return;
    this.start.set(start);
    this.end.set(end);
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseIsoDate(value: string | null | undefined): Date | null {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map((p) => parseInt(p, 10));
    const result = new Date(y, m - 1, d);
    return Number.isNaN(result.getTime()) ? null : result;
  }

  private startOfDay(input: Date): Date {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  private shiftDays(input: Date, delta: number): Date {
    const next = new Date(input);
    next.setDate(next.getDate() + delta);
    return next;
  }

  private diffInDays(from: Date, to: Date): number {
    const ms = to.getTime() - from.getTime();
    return Math.round(ms / 86_400_000);
  }
}
