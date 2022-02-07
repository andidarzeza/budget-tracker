import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

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
    this.mobileView = window.innerWidth <= 600;
    this.listenForResizeEvent();
  }

  private listenForResizeEvent(): void {
    window.addEventListener('resize', (event: any) => {
      this.mobileView = event.target.innerWidth <= 600;
    });
  }

  getHeight(difference: number): number {
    difference = this.mobileView ? (difference - 40) : 0;
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

  scrollTableToTop(): void {
    const element: HTMLCollectionOf<HTMLTableSectionElement> = document.getElementsByTagName("tbody");
    if(element.length > 0) {
      element[0].scrollTo({top: 0, behavior: 'smooth'});
    }
  }
  
}
