import { startOfDay, shiftDays } from 'src/app/utils/dates';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'day-picker',
  templateUrl: './day-picker.component.html',
  styleUrls: ['./day-picker.component.css'],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    IconButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayPickerComponent implements OnInit {
  private readonly breakpointService = inject(BreakpointService);

  /** Mobile gets the centred fullscreen Material picker (like Custom); desktop the dropdown. */
  readonly touchUi = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  date = new Date();
  from = startOfDay(this.date);
  to = shiftDays(this.from, 1);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

  ngOnInit(): void {
    this.emitDateRange();
  }

  nextDay(): void {
    this.setFrom(shiftDays(this.from, 1));
  }

  previousDay(): void {
    this.setFrom(shiftDays(this.from, -1));
  }

  onDatePicked(date: Date | null): void {
    if (!date) return;
    this.setFrom(startOfDay(date));
  }

  private setFrom(date: Date): void {
    this.from = date;
    this.to = shiftDays(date, 1);
    this.emitDateRange();
  }

  private emitDateRange(): void {
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
