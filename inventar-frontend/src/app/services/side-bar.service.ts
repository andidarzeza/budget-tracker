import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  isOpened = false;
  constructor(public sharedService: SharedService) { }

  toggleSideBar(): void {
    if(this.isOpened) {
      this.closeSideBar();
    } else {
      this.openSideBar();
    }
    this.isOpened = !this.isOpened;
  }

  private openSideBar(): void {
    const sideBar = document.getElementById('sidebar') as HTMLElement;
    const shadow = document.getElementById('shadow') as HTMLElement;
    const application = document.getElementById('application-body') as HTMLElement;
    sideBar.style.width = `${this.sharedService.sidebarWidth}px`;
    if(window.innerWidth > 1140) {
      application.style.width = `calc(${100}% - ${this.sharedService.sidebarWidth}px)`; 
    } else {
      shadow.style.opacity = "0.4";
      shadow.style.pointerEvents = "auto";
    }
    const items = document.getElementsByClassName('opened-menu-item') as HTMLCollection;
    for(var i = 0;i<items.length;i++) {
      const item = items[i] as HTMLElement;
      item.style.padding = '10px 25px';
    }
  }

  private closeSideBar(): void {
    const sideBar = document.getElementById('sidebar') as HTMLElement;
    const application = document.getElementById('application-body') as HTMLElement;
    const shadow = document.getElementById('shadow') as HTMLElement;
    const toggle = document.getElementById('toggle-id') as HTMLElement;
    sideBar.style.width = '60px';
    if(window.innerWidth > 1140) {
      application.style.width = '100%';
    } else {
      shadow.style.opacity = "0";
      shadow.style.pointerEvents = "none";
    }
    toggle.style.left = '50%';
    toggle.style.transform =  'translateX(-50%)';
    const items = document.getElementsByClassName('opened-menu-item') as HTMLCollection;
    for(var i = 0;i<items.length;i++) {
      const item = items[i] as HTMLElement;
      item.style.padding = '10px 18px';
    }
  }
}
