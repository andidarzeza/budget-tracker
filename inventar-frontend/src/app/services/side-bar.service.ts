import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SIDEBAR_WIDTH } from 'src/environments/environment';
import { SharedService } from './shared.service';

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

  constructor(public sharedService: SharedService) { }

  get mobileMenuOpen(): boolean {
    return this.mobileMenuOpenSubject.value;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpenSubject.next(!this.mobileMenuOpenSubject.value);
  }

  openMobileMenu(): void {
    if (!this.mobileMenuOpenSubject.value) {
      this.mobileMenuOpenSubject.next(true);
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpenSubject.next(false);
  }

  setDesktopSidebarLayout(isDesktop: boolean): void {
    this.desktopSidebarLayout = isDesktop;
    if (!isDesktop) {
      this.closeMobileMenu();
      this.isOpened = true;
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
    sideBar.style.width = '76px';
    localStorage.setItem('fms-sidebar', 'false');
    if (shadow) {
      shadow.style.opacity = '0';
      shadow.style.pointerEvents = 'none';
    }

  }
}
