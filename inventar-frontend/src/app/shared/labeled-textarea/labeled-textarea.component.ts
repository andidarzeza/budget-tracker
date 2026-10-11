import { ControlRefresher } from 'src/app/utils/control-refresh';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Multi-line companion to `cb-labeled-form-input`. Same wrapper, same border,
 * same focus halo — only the inner control changes (`<textarea>` instead of
 * `<input>`). Use it everywhere a long, free-form note is needed.
 *
 * @example
 *   <cb-labeled-textarea
 *     label="Description"
 *     placeholder="Write a note…"
 *     [control]="$any(form.get('description'))">
 *   </cb-labeled-textarea>
 */
@Component({
  selector: 'cb-labeled-textarea',
  imports: [ReactiveFormsModule],
  templateUrl: './labeled-textarea.component.html',
  styleUrl: './labeled-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledTextareaComponent {
  readonly control = input.required<FormControl<string | null>>();
  /** Re-render when the control changes from outside (patched value, submit). */
  private readonly refresher = new ControlRefresher();
  private readonly watchControl = effect(() => this.refresher.watch(this.control()));
  readonly label = input<string>('Label');
  readonly placeholder = input<string>('');
  readonly inputId = input<string>('labeled-textarea');
  readonly rows = input<number>(4);

  get required(): boolean {
    return this.control()?.hasValidator(Validators.required) ?? false;
  }

  get displayError(): boolean {
    const c = this.control();
    return !!c?.invalid && (c.touched || c.dirty);
  }
}
