import { inject, Injectable } from '@angular/core';
import { Chart } from 'chart.js';
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
  mobileView = false;
  readonly themeSubscribable = this.dataSource.asObservable();

  constructor() {
    this.mobileView = window.innerWidth <= 600;
    this.listenForResizeEvent();
  }

  private listenForResizeEvent(): void {
    window.addEventListener('resize', (event: any) => {
      this.mobileView = event.target.innerWidth <= 600;
    });
  }

  getHeight(difference: number): number {
    difference = this.mobileView ? difference - 40 : difference - 0;
    if (window.innerHeight <= 600) difference = difference - 40;
    if (window.innerHeight <= 400) difference = difference - 40;
    return window.innerHeight - 275 - difference;
  }

  getAnimation(entity: any): string {
    return Date.now() - new Date(entity?.lastModifiedDate).getTime() < 5000 ? 'animate-pulse' : '';
  }

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

  scrollTableToTop(): void {
    const element: HTMLCollectionOf<any> = document.getElementsByTagName('table-body');
    if (element.length > 0) {
      element[0].getElementsByTagName('div')[0].scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  changeColor(chart: Chart, backgroundColor: string, borderColor: string): void {
    if (!chart) return;
    const chartObj = chart as any;
    chartObj.data.datasets[0].backgroundColor = [backgroundColor];
    chartObj.data.datasets[0].borderColor = [borderColor];
    chartObj.data.datasets[0].pointBackgroundColor = [borderColor];
    chart.update();
  }
}
