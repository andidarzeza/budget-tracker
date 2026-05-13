import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';

@Component({
  selector: 'year-picker',
  templateUrl: './year-picker.component.html',
  styleUrls: ['./year-picker.component.css'],
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
export class YearPickerComponent implements OnInit {
  date = new Date();
  from = new Date(this.date.getFullYear(), 0, 1);
  to = new Date(this.date.getFullYear() + 1, 0, 1);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

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
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
