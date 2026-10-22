import { Injectable, signal } from '@angular/core';

/** Collapsed-rail width used when the desktop sidebar is closed. */
const SIDEBAR_RAIL_WIDTH = 76;
const SIDEBAR_WIDTH = 272;

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  public isOpened = false;
  // Signal-backed so the shell re-renders when a page shows / hides the
  // sidebar (the app runs without zone.js).
  private readonly sidebarVisible = signal(false);
  get displaySidebar(): boolean {
    return this.sidebarVisible();
  }
  set displaySidebar(value: boolean) {
    this.sidebarVisible.set(value);
  }
  /** Set from the `?hideSidebar` URL key — hides the sidebar (and the mobile menu bar) on any page. */
  readonly hiddenByUrl = signal(false);

  toggleSideBar(): void {
    this.isOpened ? this.closeSideBar() : this.openSideBar();
    this.isOpened = !this.isOpened;
  }

  openSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (sideBar) {
      sideBar.style.width = `${SIDEBAR_WIDTH}px`;
      if (shadow) {
        shadow.style.opacity = '0.4';
        shadow.style.pointerEvents = 'auto';
      }
    }
  }

  closeSideBar(): void {
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (!sideBar) {
      return;
    }
    sideBar.style.width = `${SIDEBAR_RAIL_WIDTH}px`;
    if (shadow) {
      shadow.style.opacity = '0';
      shadow.style.pointerEvents = 'none';
    }
  }
}
