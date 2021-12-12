import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IConfiguration } from '../models/IConfiguration';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private dataSource = new BehaviorSubject<string>("");
  public theme = '';
  public sidebarWidth = 15;
  public stillLoading = false;
  private darkMode = true;
  public isSpinnerEnabled = true;
  themeSubscribable = this.dataSource.asObservable();
  item: any = null;
  constructor() { }
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
    // this.fitSpinnerToPage();
  }

  private fitSpinnerToPage(): void {
    const spinner = document.getElementById('spinner-id') as HTMLElement;
    const sidebar = document.getElementById('sidebar') as HTMLElement;
    setTimeout(() => {
      if(spinner && sidebar) {
        if(sidebar.style.width === this.sidebarWidth + '%') {
          spinner.style.width = 100 - this.sidebarWidth + '%';
        } else {
          spinner.style.width= 'calc(100% - 60px)';
        }
      }
    }, 500);
  }

  checkLoadingSpinner(totalRequest: number): void { 
    if(totalRequest === 0) {
      setTimeout(()=>{
        this.stillLoading = false;
      }, 500);
    } else {
      const spinner = document.getElementById('spinner-id') as HTMLElement;
      const sidebar = document.getElementById('sidebar') as HTMLElement;
      console.log(sidebar.style.width);
      
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
