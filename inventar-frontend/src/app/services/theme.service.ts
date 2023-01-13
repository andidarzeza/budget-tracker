import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme: Theme = "light-theme";
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
    const theme = localStorage.getItem("theme");
    if(theme == "light-theme" || theme == "dark-theme") {
      this.theme = theme;
    } else {
      localStorage.setItem("theme", this.theme);
    }
    this.renderer.addClass(this.document.body, this.theme)
  };

  changeTheme = (): void => {
    this.document.body.classList.replace(this.theme, this.theme == 'dark-theme' ? (this.theme = 'light-theme') : (this.theme = 'dark-theme'));
    localStorage.setItem("theme", this.theme);
  }


  get themeValue() {
    return this.theme;
  }
}

export type Theme = "light-theme" | "dark-theme";
