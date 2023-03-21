import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
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
    this.from = this.increaseOneMonth(this.from);
    this.to = this.increaseOneMonth(this.to);
    this.emitDateRange();
  }

  previousMonth(): void {
    this.from = this.decreaseOneMonth(this.from);
    this.to = this.decreaseOneMonth(this.to);
    this.emitDateRange();
  }

  private decreaseOneMonth(input: Date): Date {
    const date = new Date();
    const month = input.getMonth() - 1;
    let year = input.getFullYear();    
    if(month == -1) {
      year--;
    }    
    date.setMonth(month);
    date.setDate(1);
    date.setFullYear(year);
    return date;
  }

  private increaseOneMonth(input: Date): Date {
    const date = new Date();
    const month = input.getMonth() + 1;
    let year = input.getFullYear();
    if(month == 12) {
      year++;
    }    
    date.setMonth(month);
    date.setDate(1);
    date.setFullYear(year);
    return date;
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
