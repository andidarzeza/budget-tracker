import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({ standalone: false,
  selector: 'day-picker',
  templateUrl: './day-picker.component.html',
  styleUrls: ['./day-picker.component.css']
})
export class DayPickerComponent implements OnInit {

  date = new Date();
  from = this.startOfDay(this.date);
  to = this.shiftDays(this.from, 1);

  @Output() onChange = new EventEmitter<{from: Date, to: Date}>();

  constructor() { }

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextDay(): void {
    this.setFrom(this.shiftDays(this.from, 1));
  }

  previousDay(): void {
    this.setFrom(this.shiftDays(this.from, -1));
  }

  onDatePicked(date: Date | null): void {
    if (!date) {
      return;
    }
    this.setFrom(this.startOfDay(date));
  }

  private setFrom(date: Date): void {
    this.from = date;
    this.to = this.shiftDays(date, 1);
    this.emitDateRange();
  }

  private startOfDay(input: Date): Date {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  private shiftDays(input: Date, delta: number): Date {
    const next = new Date(input);
    next.setDate(next.getDate() + delta);
    return next;
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
