import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Pill-style action button used across the welcome, sign-in, and sign-up
 * pages (and anywhere else the same affordance fits). Attribute-on-button
 * so the host element stays a native `<button>` — form submission, focus
 * rings, and the `disabled` attribute keep working without forwarding.
 *
 * Usage:
 *
 *   <button cb-pill-button icon="add" (click)="go('/expenses')">Add expense</button>
 *   <button cb-pill-button variant="primary" icon="login" type="submit" block>Sign in</button>
 *
 * Inputs:
 *   variant   'secondary' (default) | 'primary' — flat accent fill.
 *   icon      Material icon name placed before the projected label. Omit
 *             for a label-only pill.
 *   block     Stretch to fill the parent's width. Off by default so the
 *             pill stays auto-width like the welcome page hero actions.
 */
@Component({
  selector: 'button[cb-pill-button]',
  templateUrl: './pill-button.component.html',
  styleUrls: ['./pill-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  host: {
    'class': 'cb-pill-button',
    '[class.cb-pill-button--primary]': "variant === 'primary'",
    '[class.cb-pill-button--block]': 'block',
  },
})
export class PillButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'secondary';
  @Input() icon?: string;
  /** Coerced with `booleanAttribute` so plain `<button cb-pill-button block>`
   *  (no value) reads as `true` instead of the empty string '' (falsy). */
  @Input({ transform: booleanAttribute }) block = false;
}
