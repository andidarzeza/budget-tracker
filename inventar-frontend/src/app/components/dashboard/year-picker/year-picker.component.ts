import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
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

  nextMonth(): void {
    this.from = this.increaseOneYear(this.from);
    this.to = this.increaseOneYear(this.to);
    this.emitDateRange();
  }

  previousMonth(): void {
    this.from = this.decreaseOneYear(this.from);
    this.to = this.decreaseOneYear(this.to);
    this.emitDateRange();
  }

  private decreaseOneYear(input: Date): Date {
    const date = new Date();
    const month = input.getMonth();
    let year = input.getFullYear() - 1;
    if(month == -1) {
      year--;
    }
    date.setMonth(month);
    date.setDate(1);
    date.setFullYear(year);
    return date;
  }

  private increaseOneYear(input: Date): Date {
    const date = new Date();
    const month = input.getMonth();
    let year = input.getFullYear() + 1;    
    date.setMonth(month);
    date.setDate(1);
    date.setFullYear(year);
    return date;
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
