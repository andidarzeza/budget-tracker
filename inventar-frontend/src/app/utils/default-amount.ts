import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Category } from '../models/models';

/**
 * Pre-fill the amount from the picked category's `defaultAmount` (repeat
 * expenses, a monthly salary). Only fills an amount the user hasn't typed:
 * an empty one, or one this helper filled for a previous pick — so
 * switching category swaps the default, and a typed amount is never
 * overwritten.
 */
export function prefillDefaultAmount(
  form: FormGroup,
  amountField: string,
  categories: () => Category[],
  destroyRef: DestroyRef,
): void {
  const amount = form.get(amountField);
  let autoFilled: number | null = null;

  form
    .get('categoryID')
    ?.valueChanges.pipe(takeUntilDestroyed(destroyRef))
    .subscribe((id) => {
      if (!amount) return;
      const current = amount.value;
      const untouched =
        current === '' || current == null || (autoFilled != null && Number(current) === autoFilled);
      if (!untouched) return;

      const preset = Number(categories().find((c) => c.id == id)?.defaultAmount);
      if (Number.isFinite(preset) && preset > 0) {
        amount.setValue(preset);
        autoFilled = preset;
      } else if (autoFilled != null) {
        // The new category has no default: undo the previous pick's.
        amount.setValue('');
        autoFilled = null;
      }
    });
}
