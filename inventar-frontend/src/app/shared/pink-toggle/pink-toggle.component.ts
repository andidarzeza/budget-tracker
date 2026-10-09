import { booleanAttribute, ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from 'src/app/services/theme.service';

/**
 * iOS switch for the pink theme. With `bare` it renders only the switch
 * (e.g. as a settings row's trailing control); otherwise a heart + label row.
 */
@Component({
  selector: 'pink-toggle',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="pink-toggle" [class.pink-toggle--bare]="bare">
      @if (!bare) {
        <mat-icon class="pink-toggle__heart" fontSet="material-symbols-rounded" aria-hidden="true">favorite</mat-icon>
        <span class="pink-toggle__label">Pink theme</span>
      }
      <input type="checkbox" role="switch" aria-label="Pink theme"
        [checked]="themeService.pink()"
        (change)="themeService.setPink($any($event.target).checked)" />
      <span class="pink-toggle__track" aria-hidden="true"></span>
    </label>
  `,
  styles: [`
    :host { display: block; }

    .pink-toggle {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
      padding: 0 10px;
      border-radius: 10px;
      color: var(--app-text);
      font-family: var(--app-font-sans);
      font-size: 15px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .pink-toggle--bare {
      display: inline-flex;
      min-height: 0;
      padding: 0;
    }

    .pink-toggle__heart {
      width: 21px;
      height: 21px;
      font-size: 21px;
      color: #ff4f9a;
      font-variation-settings: 'FILL' 1;
    }

    .pink-toggle__label {
      flex: 1;
    }

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    /* UISwitch: 51×31 track, 27px white knob, springy slide. */
    .pink-toggle__track {
      position: relative;
      flex-shrink: 0;
      width: 51px;
      height: 31px;
      border-radius: 16px;
      background: var(--ios-fill);
      transition: background 0.25s ease;
    }

    .pink-toggle__track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 27px;
      height: 27px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06);
      transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.4, 1.2);
    }

    input:checked + .pink-toggle__track {
      background: #ff4f9a;
    }

    input:checked + .pink-toggle__track::after {
      transform: translateX(20px);
    }

    input:focus-visible + .pink-toggle__track {
      box-shadow: 0 0 0 3px rgba(255, 79, 154, 0.35);
    }
  `],
})
export class PinkToggleComponent {
  readonly themeService = inject(ThemeService);
  @Input({ transform: booleanAttribute }) bare = false;
}
