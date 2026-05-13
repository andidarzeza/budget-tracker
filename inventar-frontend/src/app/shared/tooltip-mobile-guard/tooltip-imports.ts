import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipMobileGuardDirective } from './tooltip-mobile-guard.directive';

/**
 * Re-exported so Angular's AOT compiler can resolve the directive symbol
 * directly from this barrel — without this line `NG3004` fires every time
 * a consumer spreads `TOOLTIP_IMPORTS` into its `imports` array.
 */
export { TooltipMobileGuardDirective } from './tooltip-mobile-guard.directive';

/**
 * Single import bundle every component should spread when it uses
 * `matTooltip` in its template. Pulls in Material's tooltip directive
 * plus the mobile-guard that disables tooltips on the table-card mobile
 * breakpoint (≤767px).
 *
 *   @Component({ imports: [..., ...TOOLTIP_IMPORTS] })
 */
export const TOOLTIP_IMPORTS = [MatTooltipModule, TooltipMobileGuardDirective] as const;
