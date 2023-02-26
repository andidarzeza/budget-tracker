import { Injectable } from '@angular/core';
import { SIDEBAR_WIDTH } from 'src/environments/environment';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  public isOpened = false;
  public sidebarWidth = SIDEBAR_WIDTH;
  public displaySidebar = false;
  constructor(public sharedService: SharedService) { }

  toggleSideBar(): void {
    this.isOpened ? this.closeSideBar() : this.openSideBar();
    this.isOpened = !this.isOpened;
  }

  openSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (sideBar) {
      sideBar.style.width = `${this.sidebarWidth}px`;
      localStorage.setItem("fms-sidebar", "true");
      if (shadow) {
        shadow.style.opacity = "0.4";
        shadow.style.pointerEvents = "auto";
      }

    }
  }

  closeSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    sideBar.style.width = '76px';
    localStorage.setItem("fms-sidebar", "false");
    if (shadow) {
      shadow.style.opacity = "0";
      shadow.style.pointerEvents = "none";
    }

  }
}
