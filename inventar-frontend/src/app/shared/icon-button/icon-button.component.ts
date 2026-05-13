import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Circular icon-only action button. Single source of truth for the
 * glass-pill affordance used on the navbar theme toggle, the balance card
 * actions, dialog close buttons, picker chevrons, etc.
 *
 * Attribute-on-button so the host stays a native `<button>` — focus
 * rings, the `disabled` attribute, and form/menu triggers keep working
 * without forwarding inputs. Project the icon as content:
 *
 *   <button cb-icon-button matTooltip="Edit" aria-label="Edit">
 *     <mat-icon>edit</mat-icon>
 *   </button>
 *
 *   <button cb-icon-button variant="danger" size="sm" matTooltip="Delete" aria-label="Delete">
 *     <mat-icon>delete</mat-icon>
 *   </button>
 *
 * Inputs:
 *   variant  'default' (accent hover) | 'danger' (red hover for destructive
 *            actions like delete / clear).
 *   size     'md' (40px, default) | 'sm' (32px, for inline-row actions like
 *            row delete or input-suffix clear).
 *
 * Tooltips: add `matTooltip="…"` like any Material button. Consumers must
 * import both `MatTooltipModule` and `TooltipMobileGuardDirective` (see
 * `shared/tooltip-mobile-guard`) — the latter auto-disables tooltips on
 * the table-card mobile breakpoint (≤767px).
 */
@Component({
  selector: 'button[cb-icon-button]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./icon-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cb-icon-button',
    '[class.cb-icon-button--danger]': "variant === 'danger'",
    '[class.cb-icon-button--sm]': "size === 'sm'",
  },
})
export class IconButtonComponent {
  @Input() variant: 'default' | 'danger' = 'default';
  @Input() size: 'md' | 'sm' = 'md';
}
