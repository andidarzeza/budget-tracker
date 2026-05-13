import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { BreakpointService } from 'src/app/services/breakpoint.service';

/**
 * Co-resides with `[matTooltip]` and toggles its `disabled` flag based on
 * the table-card mobile breakpoint (≤767px). Touch press-and-hold tooltips
 * clash with the app's drawer / swipe gestures, so we suppress every
 * tooltip on small screens.
 *
 * Add to a component's imports alongside `MatTooltipModule`:
 *
 *   imports: [..., MatTooltipModule, TooltipMobileGuardDirective],
 *
 * The directive attaches automatically wherever `matTooltip` appears in
 * that component's template — consumers don't have to add any extra
 * attribute on the elements themselves.
 */
@Directive({
  selector: '[matTooltip]',
  standalone: true,
})
export class TooltipMobileGuardDirective {
  private readonly tooltip = inject(MatTooltip);
  private readonly breakpoint = inject(BreakpointService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.breakpoint.useTableCardLayout$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mobile) => (this.tooltip.disabled = mobile));
  }
}
