import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SIDEBAR_WIDTH } from 'src/environments/environment';
import { SharedService } from './shared.service';

/** Collapsed-rail width used when the desktop sidebar is closed. */
const SIDEBAR_RAIL_WIDTH = 76;

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  public isOpened = false;
  public sidebarWidth = SIDEBAR_WIDTH;
  public displaySidebar = false;
  /** When false, width expand/collapse is handled by mobile drawer CSS only. */
  public desktopSidebarLayout = true;

  private readonly mobileMenuOpenSubject = new BehaviorSubject(false);
  readonly mobileMenuOpen$ = this.mobileMenuOpenSubject.asObservable();

  /** Current horizontal space (px) occupied by the sidebar on desktop.
   *  Emits 0 on mobile so consumers (e.g. the navbar) can align flush-left. */
  private readonly currentWidthSubject = new BehaviorSubject<number>(SIDEBAR_RAIL_WIDTH);
  readonly currentWidth$ = this.currentWidthSubject.asObservable();

  get mobileMenuOpen(): boolean {
    return this.mobileMenuOpenSubject.value;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpenSubject.next(!this.mobileMenuOpenSubject.value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpenSubject.next(false);
  }

  setDesktopSidebarLayout(isDesktop: boolean): void {
    this.desktopSidebarLayout = isDesktop;
    if (!isDesktop) {
      this.closeMobileMenu();
      this.isOpened = true;
      this.currentWidthSubject.next(0);
    } else {
      this.currentWidthSubject.next(this.isOpened ? this.sidebarWidth : SIDEBAR_RAIL_WIDTH);
    }
  }

  toggleSideBar(): void {
    if (!this.desktopSidebarLayout) {
      return;
    }
    this.isOpened ? this.closeSideBar() : this.openSideBar();
    this.isOpened = !this.isOpened;
  }

  openSideBar(): void {
    if (!this.desktopSidebarLayout) {
      return;
    }
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (sideBar) {
      sideBar.style.width = `${this.sidebarWidth}px`;
      localStorage.setItem('fms-sidebar', 'true');
      if (shadow) {
        shadow.style.opacity = '0.4';
        shadow.style.pointerEvents = 'auto';
      }

    }
    this.currentWidthSubject.next(this.sidebarWidth);
  }

  closeSideBar(): void {
    if (!this.desktopSidebarLayout) {
      return;
    }
    const sideBar: HTMLElement = document.getElementById('sidebar');
    const shadow: HTMLElement = document.getElementById('shadow');
    if (!sideBar) {
      return;
    }
    sideBar.style.width = `${SIDEBAR_RAIL_WIDTH}px`;
    localStorage.setItem('fms-sidebar', 'false');
    if (shadow) {
      shadow.style.opacity = '0';
      shadow.style.pointerEvents = 'none';
    }
    this.currentWidthSubject.next(SIDEBAR_RAIL_WIDTH);
  }
}
