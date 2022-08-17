import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSource = new BehaviorSubject<string>("");
  public theme: string = 'dark';
  public stillLoading: boolean = false;
  public darkMode: boolean = true;
  public isSpinnerEnabled: boolean = true;
  public mobileView: boolean = false;
  private totalRequests: number = 0;
  themeSubscribable = this.dataSource.asObservable();

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
    difference = this.mobileView ? (difference - 40) : difference - 0;
    if(window.innerHeight <= 600) difference = difference - 40;
    if(window.innerHeight <= 400) difference = difference - 40;    
    return window.innerHeight - 275 - difference;
  }

  getAnimation(entity: any): string {
    return (Date.now() - new Date(entity?.lastModifiedDate).getTime() < 5000) ? 'animate-pulse' : '';
  }

  changeTheme(darkMode: boolean): void {
    this.darkMode = darkMode;
    this.theme = this.darkMode ? 'dark' : 'light';
    this.dataSource.next(this.theme);
  }

  listenForThemeChange(): void {
    this.themeSubscribable
      .pipe(filter(value => value !== ""))
      .subscribe(theme => this.theme = theme);
  }

  activateLoadingSpinner(): void {
    this.totalRequests++;
    this.stillLoading = true;
  }

  checkLoadingSpinner(): void {
    this.totalRequests--;
    if(this.totalRequests === 0)  setTimeout(() => this.stillLoading = false, 500);
  }

  public changeColor(chart: Chart, backgroundColor: string, borderColor: string): void {
    if(chart) {
      let chartObj = chart as any;
      chartObj.data.datasets[0].backgroundColor = [backgroundColor];
      chartObj.data.datasets[0].borderColor = [borderColor];
      chartObj.data.datasets[0].pointBackgroundColor = [borderColor];    
      chart.update();
    }
    
  }
  
}
