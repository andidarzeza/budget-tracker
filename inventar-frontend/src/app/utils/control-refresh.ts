import { ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Keeps an OnPush form-field component in sync with its control when the
 * control changes from outside (the app runs zoneless): a value patched after
 * a request, `markAllAsTouched()` on submit (shows "required" errors),
 * enable / disable. Create it in a field initializer, then call `watch()`
 * with the current control (from `ngOnChanges`, or an `effect` for signal
 * inputs).
 */
export class ControlRefresher {
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription: Subscription | null = null;
  private control: AbstractControl | null | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  watch(control: AbstractControl | null | undefined): void {
    if (control === this.control) return;
    this.subscription?.unsubscribe();
    this.control = control;
    this.subscription = control ? control.events.subscribe(() => this.cdr.markForCheck()) : null;
  }
}
