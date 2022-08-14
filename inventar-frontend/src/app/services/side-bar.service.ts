import { Injectable } from '@angular/core';
import { SIDEBAR_WIDTH } from 'src/environments/environment';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  public isOpened = true;
  public sidebarWidth = SIDEBAR_WIDTH;
  public displaySidebar = false;
  constructor(public sharedService: SharedService) { }

  toggleSideBar(): void {
    this.isOpened ? this.closeSideBar() : this.openSideBar();
    this.isOpened = !this.isOpened;
  }

  private openSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (sideBar) {
      sideBar.style.width = `${this.sidebarWidth}px`;
      if (shadow) {
        shadow.style.opacity = "0.4";
        shadow.style.pointerEvents = "auto";
      }

    }
  }

  private closeSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (this.sharedService.mobileView) sideBar.style.width = '0px';
    else sideBar.style.width = '76px';
    if (shadow) {
      shadow.style.opacity = "0";
      shadow.style.pointerEvents = "none";
    }

  }
}
