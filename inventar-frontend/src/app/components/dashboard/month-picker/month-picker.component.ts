import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.css'],
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
export class MonthPickerComponent implements OnInit {
  private readonly breakpointService = inject(BreakpointService);

  /** Mobile gets the centred fullscreen Material picker (like Custom); desktop the dropdown. */
  readonly touchUi = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  date = new Date();
  from = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  to = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

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
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
