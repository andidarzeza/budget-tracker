import { DOCUMENT } from '@angular/common';
import { inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SharedService } from './shared.service';

const MODE_KEY = 'theme-mode';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly sharedService = inject(SharedService);
  private readonly systemDark = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;

  /** What the user picked: an explicit theme, or follow the OS. */
  private readonly _mode = signal<ThemeMode>('system');
  readonly mode = this._mode.asReadonly();

  /** The theme actually applied to <body>. */
  private readonly _theme = signal<Theme>('light-theme');

  /** Read-only signal — useful inside `effect()` / templates. */
  readonly theme = this._theme.asReadonly();

  private readonly subject = new Subject<string>();
  readonly colorChange: Observable<string> = this.subject.asObservable();

  constructor() {
    this.systemDark?.addEventListener?.('change', () => {
      if (this._mode() === 'system') this.apply();
    });
  }

  next(color: string): void {
    this.subject.next(color);
  }

  initTheme = (): void => {
    const storedMode = localStorage.getItem(MODE_KEY);
    const legacy = localStorage.getItem('theme');
    let mode: ThemeMode = 'system';
    if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
      mode = storedMode;
    } else if (legacy === 'light-theme' || legacy === 'dark-theme') {
      mode = legacy === 'dark-theme' ? 'dark' : 'light';
    }
    this._mode.set(mode);
    this.apply();
  };

  setMode = (mode: ThemeMode): void => {
    this._mode.set(mode);
    localStorage.setItem(MODE_KEY, mode);
    this.apply();
  };

  /** Flip between light and dark (pins an explicit mode). */
  changeTheme = (): void => {
    this.setMode(this._theme() === 'dark-theme' ? 'light' : 'dark');
  };

  /** Backwards-compatible alias — many call sites read `themeValue`. */
  get themeValue(): Theme {
    return this._theme();
  }

  private apply(): void {
    const mode = this._mode();
    const dark = mode === 'dark' || (mode === 'system' && !!this.systemDark?.matches);
    const next: Theme = dark ? 'dark-theme' : 'light-theme';
    this._theme.set(next);
    localStorage.setItem('theme', next);
    this.applyThemeClass();
    this.sharedService.applyBodyTheme(next);
  }

  /** Ensure exactly one of `light-theme` / `dark-theme` is on <body>. */
  private applyThemeClass(): void {
    const body = this.document.body;
    const current = this._theme();
    const other: Theme = current === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.renderer.removeClass(body, other);
    this.renderer.addClass(body, current);
  }
}

export type Theme = 'light-theme' | 'dark-theme';
export type ThemeMode = 'light' | 'dark' | 'system';
