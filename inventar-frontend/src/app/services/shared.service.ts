import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigurationService } from './configuration.service';
import { Theme as BodyPaletteTheme } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private readonly configurationService = inject(ConfigurationService);

  private readonly dataSource = new BehaviorSubject<string>('');
  theme: string = 'dark';
  darkMode = true;
  private readonly themeSubscribable = this.dataSource.asObservable();

  changeTheme(): void {
    this.darkMode = this.configurationService.configuration.darkMode;
    this.theme = this.darkMode ? 'dark' : 'light';
    this.dataSource.next(this.theme);
  }

  /** Keep `theme` / `darkMode` aligned with `body` light-theme vs dark-theme (navbar toggle). */
  applyBodyTheme(bodyTheme: BodyPaletteTheme): void {
    this.darkMode = bodyTheme === 'dark-theme';
    this.theme = this.darkMode ? 'dark' : 'light';
    this.dataSource.next(this.theme);
  }

  listenForThemeChange(): void {
    this.themeSubscribable
      .pipe(filter((value) => value !== ''))
      .subscribe((theme) => (this.theme = theme));
  }
}
