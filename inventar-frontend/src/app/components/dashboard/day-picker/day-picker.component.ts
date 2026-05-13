import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'day-picker',
  templateUrl: './day-picker.component.html',
  styleUrls: ['./day-picker.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    IconButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class DayPickerComponent implements OnInit {
  date = new Date();
  from = this.startOfDay(this.date);
  to = this.shiftDays(this.from, 1);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

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
    if (!date) return;
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
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
