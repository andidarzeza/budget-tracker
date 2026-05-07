import {
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Generic select-style input. Replaces the look-and-feel of `mat-select`
 * with a styled trigger + dropdown that matches the rest of the app's form
 * controls (see `cb-labeled-form-input`).
 *
 * Two type params:
 *  - `T`    — the value stored on the form control.
 *  - `OptT` — the option type rendered in the list. Defaults to `T` for the
 *             common case where the control stores the option directly
 *             (e.g. `T = string` for a currency picker).
 *
 * For object options where the form control stores only an id, set `OptT`
 * to the object type and provide `valueWith` to map the option → stored id.
 *
 * @example   // primitives — defaults work
 *   <cb-select-input
 *     label="Currency"
 *     icon="public"
 *     [control]="$any(form.get('currency'))"
 *     [options]="['USD', 'EUR', 'GBP']"
 *   ></cb-select-input>
 *
 * @example   // objects, store the id
 *   <cb-select-input
 *     label="Category"
 *     [control]="$any(form.get('categoryID'))"
 *     [options]="categories()"
 *     [displayWith]="(c) => c.category"
 *     [valueWith]="(c) => c.id"
 *     emptyText="No categories yet">
 *   </cb-select-input>
 */
@Component({
  selector: 'cb-select-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './select-input.component.html',
  styleUrl: './select-input.component.scss',
})
export class SelectInputComponent<T, OptT = T> {
  readonly trigger = viewChild<ElementRef<HTMLDivElement>>('trigger');

  /** Form control to bind. The control's value type is `T | null`. */
  readonly control = input.required<FormControl<T | null>>();
  /** Options to render in the dropdown. */
  readonly options = input.required<readonly OptT[]>();

  readonly label = input<string>('Select');
  readonly placeholder = input<string>('Select…');
  readonly emptyText = input<string>('No options available');
  /** Optional Material icon name shown at the start of the trigger. */
  readonly icon = input<string | null>(null);

  /**
   * How to render an option's display text. Default stringifies the option,
   * which works for primitives (string, number, enum). Provide a custom
   * function for object options.
   */
  readonly displayWith = input<(opt: OptT) => string>((o) =>
    o == null ? '' : String(o),
  );

  /**
   * Maps an option to the value stored on the form control. Default is an
   * identity cast, which is correct when `OptT === T`. Override when the
   * control stores a derived value (e.g. an `id`).
   */
  readonly valueWith = input<(opt: OptT) => T>((o) => o as unknown as T);

  /**
   * Equality predicate used to highlight the currently-selected option.
   * Compares the form control's stored value against the option's mapped
   * value (i.e. `valueWith(opt)`). Reference equality by default.
   */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>(
    (a, b) => a === b,
  );

  /** Custom message to override the built-in "This field is required." */
  readonly requiredErrorMessage = input<string>('This field is required.');

  readonly dropdownOpen = signal(false);

  get required(): boolean {
    return this.control().hasValidator(Validators.required);
  }

  get displayError(): boolean {
    const c = this.control();
    return c.invalid && (c.touched || c.dirty);
  }

  get selectedValue(): T | null {
    return this.control().value;
  }

  /** True iff the control currently holds any value (excluding null/undefined). */
  get hasValue(): boolean {
    const v = this.control().value;
    return v !== null && v !== undefined;
  }

  /** Display text for the currently-selected value (looks up the option). */
  get selectedDisplay(): string {
    const v = this.control().value;
    if (v === null || v === undefined) return '';
    const match = this.options().find((opt) =>
      this.compareWith()(v, this.valueWith()(opt)),
    );
    return match !== undefined ? this.displayWith()(match) : String(v);
  }

  isSelected(opt: OptT): boolean {
    return this.compareWith()(this.selectedValue, this.valueWith()(opt));
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  /**
   * Select an option. Bound on `mousedown` so it fires before the trigger's
   * `blur` (which would close the dropdown and swallow the click).
   */
  onSelect(opt: OptT, event?: MouseEvent): void {
    event?.preventDefault();
    this.control().setValue(this.valueWith()(opt));
    this.control().markAsDirty();
    this.dropdownOpen.set(false);
    this.trigger()?.nativeElement?.blur();
  }

  onBlur(): void {
    this.control().markAsTouched();
    this.dropdownOpen.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.dropdownOpen()) {
      event.stopPropagation();
      this.dropdownOpen.set(false);
    } else if (
      (event.key === 'Enter' || event.key === ' ') &&
      !this.dropdownOpen()
    ) {
      event.preventDefault();
      this.dropdownOpen.set(true);
    }
  }
}
