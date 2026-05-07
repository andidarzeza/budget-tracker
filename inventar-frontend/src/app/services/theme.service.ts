import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme: Theme = 'light-theme';
  private renderer: Renderer2;

  private subject = new Subject<string>();
  public colorChange: Observable<string> = this.subject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public next(color: string): void {
    this.subject.next(color);
  }

  initTheme = (): void => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light-theme' || stored === 'dark-theme') {
      this.theme = stored;
    } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark-theme';
    }
    localStorage.setItem('theme', this.theme);
    this.applyThemeClass();
  };

  changeTheme = (): void => {
    this.theme = this.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', this.theme);
    this.applyThemeClass();
  };

  get themeValue() {
    return this.theme;
  }

  /** Ensure exactly one of `light-theme` / `dark-theme` is on <body>. */
  private applyThemeClass(): void {
    const body = this.document.body;
    const other: Theme = this.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.renderer.removeClass(body, other);
    this.renderer.addClass(body, this.theme);
  }
}

export type Theme = 'light-theme' | 'dark-theme';
