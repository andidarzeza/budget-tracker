import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'day-picker',
  templateUrl: './day-picker.component.html',
  styleUrls: ['./day-picker.component.css']
})
export class DayPickerComponent implements OnInit {
  
  date = new Date();
  from = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  to = new Date(this.date.getFullYear(), this.date.getMonth(), 2);

  @Output() onChange = new EventEmitter<{from: Date, to: Date}>();
  
  constructor() { }

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextDay(): void {
    this.from = this.increaseOneDay(this.from);
    this.to = this.increaseOneDay(this.to);
    this.emitDateRange();
  }

  previousDay(): void {
    this.from = this.decreaseOneDay(this.from);
    this.to = this.decreaseOneDay(this.to);
    this.emitDateRange();
  }

  private decreaseOneDay(input: Date): Date {
    input.setDate(input.getDate() - 1);
    return new Date(input.getTime());
  }

  private increaseOneDay(input: Date): Date {
    input.setDate(input.getDate() + 1);
    return new Date(input.getTime());
  }

  private emitDateRange(): void {
    this.onChange.emit({from: this.from, to: this.to});
  }

}
