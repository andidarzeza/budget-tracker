import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

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
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './labeled-date-input.component.html',
  styleUrl: './labeled-date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledDateInputComponent {
  @Input({ required: true }) control!: FormControl<Date | null>;
  @Input() inputId = '';
  @Input() label = 'Date';
  @Input() placeholder = '';

  get required(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  get displayError(): boolean {
    return this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }
}
