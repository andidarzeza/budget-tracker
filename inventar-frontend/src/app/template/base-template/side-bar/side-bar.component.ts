import { AfterViewInit, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { MenuItem, SideBarMode } from '../base-template.models';

@Component({
  standalone: false,
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnChanges, AfterViewInit {
  readonly sharedService = inject(SharedService);
  readonly authenticationService = inject(AuthenticationService);
  readonly sideBarService = inject(SideBarService);
  readonly router = inject(Router);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  @Input() navigation: MenuItem[];
  @Input() sideBarMode: SideBarMode;
  /** Slides in from the left as a half-width overlay (narrow screens). */
  @Input() mobileDrawer = false;

  selIndex = 1;

  ngAfterViewInit(): void {
    if (this.mobileDrawer) {
      return;
    }
    this.applyStoredSidebarWidth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mobileDrawer']) {
      this.sideBarService.setDesktopSidebarLayout(!this.mobileDrawer);
      if (!this.mobileDrawer && !changes['mobileDrawer'].firstChange) {
        this.applyStoredSidebarWidth();
      }
    }
    this.navigation?.forEach((item: MenuItem) => {
      if (item.link === window.location.pathname || window.location.pathname.includes(item.link)) {
        setTimeout(() => {
          this.animateSelectedOption(this.navigation.indexOf(item));
        }, 0);
      }
    });
  }

  private applyStoredSidebarWidth(): void {
    const sideBarStatus = localStorage.getItem('fms-sidebar');
    if (sideBarStatus === 'true') {
      this.sideBarService.isOpened = true;
      this.sideBarService.openSideBar();
    } else {
      this.sideBarService.isOpened = false;
      this.sideBarService.closeSideBar();
    }
  }

  activateSpinner(): void {
    this.routeSpinnerService.startLoading();
  }

  onBrandClick(): void {
    if (this.mobileDrawer) {
      this.sideBarService.closeMobileMenu();
    }
  }

  onNavItemClick(index: number): void {
    this.activateSpinner();
    this.animateSelectedOption(index);
    if (this.mobileDrawer) {
      this.sideBarService.closeMobileMenu();
    }
  }

  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById('active-item') as HTMLElement;
    if (activeItem) {
      const margin = index + 1;
      activeItem.style.transform = `translate(0%, calc(${index * 100}% + ${index * 3 + margin * 3}px))`;
    }
  }
}
