import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({ standalone: false,
  selector: 'month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.css']
})
export class MonthPickerComponent implements OnInit {

  date = new Date();
  from = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  to = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);

  @Output() onChange = new EventEmitter<{from: Date, to: Date}>();

  constructor() { }

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextMonth(): void {
    this.setMonth(this.from.getFullYear(), this.from.getMonth() + 1);
  }

  previousMonth(): void {
    this.setMonth(this.from.getFullYear(), this.from.getMonth() - 1);
  }

  onMonthPicked(date: Date, picker: MatDatepicker<Date>): void {
    this.setMonth(date.getFullYear(), date.getMonth());
    picker.close();
  }

  private setMonth(year: number, monthIndex: number): void {
    this.from = new Date(year, monthIndex, 1);
    this.to = new Date(year, monthIndex + 1, 1);
    this.emitDateRange();
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
