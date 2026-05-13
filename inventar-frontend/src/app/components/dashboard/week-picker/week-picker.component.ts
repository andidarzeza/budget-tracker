import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';

@Component({
  selector: 'week-picker',
  templateUrl: './week-picker.component.html',
  styleUrls: ['./week-picker.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    IconButtonComponent,
  ],
})
export class WeekPickerComponent implements OnInit {
  date = new Date();
  from = this.startOfWeek(this.date);
  to = this.shiftDays(this.from, 7);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

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
    if (!date) return;
    this.setFrom(this.startOfWeek(date));
  }

  /** End-of-week label is from + 6 days (the inclusive Sunday). */
  get displayEnd(): Date {
    return this.shiftDays(this.from, 6);
  }

  /** Monday-based week start, normalized to local midnight. */
  private startOfWeek(input: Date): Date {
    const d = new Date(input.getFullYear(), input.getMonth(), input.getDate());
    const day = d.getDay();
    const offset = (day + 6) % 7;
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
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
