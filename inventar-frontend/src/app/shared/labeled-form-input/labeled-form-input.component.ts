import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
  readonly control = input.required<FormControl<string | number | null>>();
  /** Optional explicit input id. */
  readonly inputId = input<string>('');
  readonly label = input<string>('Label');
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'number' | 'tel' | 'password' | 'email'>('text');
  /** Optional custom message for min-value validation errors. */
  readonly minErrorKey = input<string | null>(null);
  /** Optional Material icon name to show at the start of the input. */
  readonly icon = input<string | null>(null);
  readonly readonly = input<boolean>(false);

  get required(): boolean {
    return this.control().hasValidator(Validators.required);
  }

  get displayError(): boolean {
    return this.control().invalid && (this.control().touched || this.control().dirty);
  }

  onKeyPress(event: KeyboardEvent): void {
    if(this.type() === "tel") {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault(); // Prevent non-numeric character input
      }
    }
  }

  onBlur(): void {
    if(this.type() === "tel") {
      const control = this.control() as any;
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
