import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({ standalone: false,
  selector: 'week-picker',
  templateUrl: './week-picker.component.html',
  styleUrls: ['./week-picker.component.css']
})
export class WeekPickerComponent implements OnInit {

  date = new Date();
  from = this.startOfWeek(this.date);
  to = this.shiftDays(this.from, 7);

  @Output() onChange = new EventEmitter<{from: Date, to: Date}>();

  constructor() { }

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextWeek(): void {
    this.setFrom(this.shiftDays(this.from, 7));
  }

  previousWeek(): void {
    this.setFrom(this.shiftDays(this.from, -7));
  }

  onDatePicked(date: Date | null): void {
    if (!date) {
      return;
    }
    this.setFrom(this.startOfWeek(date));
  }

  /** Monday-based week start, normalized to local midnight. */
  private startOfWeek(input: Date): Date {
    const d = new Date(input.getFullYear(), input.getMonth(), input.getDate());
    const day = d.getDay(); // 0 = Sun
    const offset = (day + 6) % 7; // days since Monday
    d.setDate(d.getDate() - offset);
    return d;
  }

  private setFrom(date: Date): void {
    this.from = date;
    this.to = this.shiftDays(date, 7);
    this.emitDateRange();
  }

  private shiftDays(input: Date, delta: number): Date {
    const next = new Date(input);
    next.setDate(next.getDate() + delta);
    return next;
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

  /** End-of-week label is from + 6 days (the inclusive Sunday). */
  get displayEnd(): Date {
    return this.shiftDays(this.from, 6);
  }

}
