import { DOCUMENT } from '@angular/common';
import { inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private readonly _theme = signal<Theme>('light-theme');

  /** Read-only signal — useful inside `effect()` / templates. */
  readonly theme = this._theme.asReadonly();

  private readonly subject = new Subject<string>();
  readonly colorChange: Observable<string> = this.subject.asObservable();

  next(color: string): void {
    this.subject.next(color);
  }

  initTheme = (): void => {
    const stored = localStorage.getItem('theme');
    let next: Theme = 'light-theme';
    if (stored === 'light-theme' || stored === 'dark-theme') {
      next = stored;
    } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      next = 'dark-theme';
    }
    this._theme.set(next);
    localStorage.setItem('theme', next);
    this.applyThemeClass();
  };

  changeTheme = (): void => {
    const next: Theme = this._theme() === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this._theme.set(next);
    localStorage.setItem('theme', next);
    this.applyThemeClass();
  };

  /** Backwards-compatible alias — many call sites read `themeValue`. */
  get themeValue(): Theme {
    return this._theme();
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
