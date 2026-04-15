import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cb-labeled-form-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './labeled-form-input.component.html',
  styleUrl: './labeled-form-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledFormInputComponent {
  /** Form control to bind; value stays in sync when user types or when parent updates the control. */
  @Input({ required: true }) control!: FormControl<string | number | null>;
  /** Optional explicit input id. */
  @Input() inputId = '';
  @Input() label = 'Label';
  @Input() placeholder = '';
  @Input() type: 'text' | 'number' | 'tel' | 'password' | 'email' = 'text';
  /** Optional custom message for min-value validation errors. */
  @Input() minErrorKey: string | null = null;
  /** Optional Material icon name to show at the start of the input. */
  @Input() icon: string | null = null;
  @Input() readonly = false;

  get required(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  get displayError(): boolean {
    return this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (this.type === "tel") {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault(); // Prevent non-numeric character input
      }
    }
  }

  onBlur(): void {
    if (this.type === "tel") {
      const control = this.control as any;
      if (control?.value) {
        // Remove all non-numeric characters
        if (control?.value?.startsWith("0")) {
          control?.setValue(control?.value.slice(1));
        }
  
        const cleaned = control?.value.replace(/\D/g, '');
  
        control?.setValue(cleaned.replace(
          /^(\d{2})(\d{3})(\d{4})(.*)$/,
          (match: any, p1: any, p2: any, p3: any, p4: any) => `${p1} ${p2} ${p3}${p4 ? ' ' + p4 : ''}`
        ));
      }
    }
  }

}
