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
    /* iOS UISegmentedControl. */
    .theme-switch { display: flex; gap: 0; padding: 2px; border-radius: 9px; background: var(--ios-fill-3); }
    button {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      height: 28px;
      border: none;
      border-radius: 7px;
      background: none;
      color: var(--app-text);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }
    button:not(.active):active { opacity: 0.5; }
    button.active { background: var(--ios-seg-thumb); font-weight: 600; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04); }
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
