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
  themeSubscribable = this.dataSource.asObservable();
  item: any = null;
  constructor() { 
    this.mobileView = window.screen.width < 600;
    this.listenForResizeEvent();
  }

  private listenForResizeEvent(): void {
    window.addEventListener('resize', (event: any) => {
      this.mobileView = event.target.innerWidth < 600;
    });
  }

  changeTheme(darkMode: any): void {
    this.darkMode = darkMode;
    this.darkMode? this.theme = 'dark': this.theme = 'light';
    this.dataSource.next(this.theme);
  }

  listenForThemeChange(): void {
    this.themeSubscribable.subscribe((theme => {
      if(theme !== "")
      this.theme = theme;
    }));
  }

  activateLoadingSpinner(): void {
    this.stillLoading = true;
  }

  checkLoadingSpinner(totalRequest: number): void { 
    if(totalRequest === 0) {
      setTimeout(()=>{
        this.stillLoading = false;
      }, 500);
    } else {
      const spinner = document.getElementById('spinner-id') as HTMLElement;
      const sidebar = document.getElementById('sidebar') as HTMLElement;      
      if(sidebar.style.width === '18%') {
        if(spinner) {
          spinner.style.width= '82%';
        }
      } else {
        if(spinner) {
          spinner.style.width= 'calc(100% - 60px)';
        }
      }
    }
  }
}
