import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({ standalone: false,
  selector: 'year-picker',
  templateUrl: './year-picker.component.html',
  styleUrls: ['./year-picker.component.css']
})
export class YearPickerComponent implements OnInit {

  date = new Date();
  from = new Date(this.date.getFullYear(), 0, 1);
  to = new Date(this.date.getFullYear() + 1, 0, 1);

  @Output() onChange = new EventEmitter<{from: Date, to: Date}>();

  constructor() { }

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextYear(): void {
    this.setYear(this.from.getFullYear() + 1);
  }

  previousYear(): void {
    this.setYear(this.from.getFullYear() - 1);
  }

  onYearPicked(date: Date, picker: MatDatepicker<Date>): void {
    this.setYear(date.getFullYear());
    picker.close();
  }

  private setYear(year: number): void {
    this.from = new Date(year, 0, 1);
    this.to = new Date(year + 1, 0, 1);
    this.emitDateRange();
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
