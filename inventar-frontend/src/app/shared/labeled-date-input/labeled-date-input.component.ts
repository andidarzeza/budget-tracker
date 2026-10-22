import { ControlRefresher } from 'src/app/utils/control-refresh';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from 'src/app/services/breakpoint.service';

/**
 * Date field that mirrors the chrome of `cb-labeled-form-input` (same border,
 * focus halo, light/dark theme overrides) but opens a real Material
 * `<mat-datepicker>` overlay — matching the dashboard date pickers.
 *
 * The visible `<input>` is the one the `[matDatepicker]` directive binds to,
 * so two-way value sync, validation and parsing are all handled by the
 * native MatDatepickerInput. The input itself is read-only — clicks anywhere
 * on the wrapper open the calendar.
 */
@Component({
  selector: 'cb-labeled-date-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  templateUrl: './labeled-date-input.component.html',
  styleUrl: './labeled-date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledDateInputComponent {
  /** Clicking the label or row padding opens the calendar (the field itself already does). */
  openFromRow(event: MouseEvent, picker: MatDatepicker<Date>): void {
    if (!(event.target as Element).closest('.input-wrapper')) picker.open();
  }

  private readonly breakpointService = inject(BreakpointService);

  /** Re-render when the control changes from outside (patched value, submit). */
  private readonly refresher = new ControlRefresher();
  private _control!: FormControl<Date | null>;
  @Input({ required: true })
  set control(control: FormControl<Date | null>) {
    this._control = control;
    this.refresher.watch(control);
  }
  get control(): FormControl<Date | null> {
    return this._control;
  }
  @Input() inputId = '';
  @Input() label = 'Date';
  @Input() placeholder = '';

  /**
   * Switches `<mat-datepicker>` into its full-screen modal mode on phones, so
   * the calendar gets the comfortable touch targets and centred layout
   * Material designed for handheld viewports.
   */
  readonly touchUi = toSignal(this.breakpointService.useTableCardLayout$, {
    initialValue: this.breakpointService.matchesMobileCreateLayout(),
  });

  get required(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  get displayError(): boolean {
    return this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }
}
