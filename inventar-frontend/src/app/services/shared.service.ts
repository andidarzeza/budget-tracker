import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSource = new BehaviorSubject<string>("");
  public theme: string = 'dark';
  public stillLoading: boolean = false;
  private darkMode: boolean = true;
  public isSpinnerEnabled: boolean = true;
  public mobileView: boolean = false;
  private totalRequests: number = 0;
  themeSubscribable = this.dataSource.asObservable();

  constructor() { 
    this.mobileView = window.innerWidth < 600;
    this.listenForResizeEvent();
  }

  private listenForResizeEvent(): void {
    window.addEventListener('resize', (event: any) => {
      this.mobileView = event.target.innerWidth < 600;
    });
  }

  getHeight(difference: number): number {
    difference = this.mobileView ? (difference - 40) : 0;
    return window.innerHeight - 275 - difference;
  }

  getAnimation(entity: any): string {
    return (Date.now() - new Date(entity?.lastModifiedDate).getTime() < 5000) ? 'animate-pulse' : '';
  }

  changeTheme(darkMode: any): void {
    this.darkMode = darkMode;
    this.theme = this.darkMode ? 'dark' : 'light';
    this.dataSource.next(this.theme);
  }

  listenForThemeChange(): void {
    this.themeSubscribable.subscribe((theme => {
      if(theme !== "")
      this.theme = theme;
    }));
  }

  activateLoadingSpinner(): void {
    this.totalRequests++;
    this.stillLoading = true;
  }

  checkLoadingSpinner(): void {
    this.totalRequests--;
    if(this.totalRequests === 0)  setTimeout(() => this.stillLoading = false, 500);
  }
}
