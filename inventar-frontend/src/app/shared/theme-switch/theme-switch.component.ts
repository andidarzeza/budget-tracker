import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeMode, ThemeService } from 'src/app/services/theme.service';

/** Light / Dark / Auto segmented control. */
@Component({
  selector: 'theme-switch',
  imports: [MatIconModule],
  template: `
    <div class="theme-switch" role="radiogroup" aria-label="Theme">
      @for (o of options; track o.value) {
        <button type="button" role="radio"
          [attr.aria-checked]="themeService.mode() === o.value"
          [class.active]="themeService.mode() === o.value"
          (click)="themeService.setMode(o.value)">
          <mat-icon>{{ o.icon }}</mat-icon> {{ o.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .theme-switch { display: flex; gap: 2px; padding: 3px; border-radius: 9px; background: var(--mat-sys-surface-container-high, #eeeef0); }
    :host-context(.light-theme) .theme-switch { background: #eeeef0; }
    :host-context(.dark-theme) .theme-switch { background: #27272b; }
    button {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      height: 26px;
      border: none;
      border-radius: 6px;
      background: none;
      color: var(--app-text-subtle);
      font: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { color: var(--app-text); }
    button.active { background: var(--app-surface); color: var(--app-text); box-shadow: var(--app-shadow-sm); }
    mat-icon { width: 13px; height: 13px; font-size: 13px; line-height: 13px; }
  `],
})
export class ThemeSwitchComponent {
  readonly themeService = inject(ThemeService);

  readonly options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    { value: 'system', label: 'Auto', icon: 'desktop_windows' },
  ];
}
