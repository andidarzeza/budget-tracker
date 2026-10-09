import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { inOutAnimation, slider } from 'src/app/animations';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { MobileTabBarComponent } from './mobile-tab-bar/mobile-tab-bar.component';
import { MenuItem, SideBarMode } from './base-template.models';


@Component({
  selector: 'base-template',
  templateUrl: './base-template.component.html',
  styleUrls: ['./base-template.component.css'],
  imports: [CommonModule, NavBarComponent, SideBarComponent, MobileTabBarComponent],
  animations: [inOutAnimation, slider],
})
export class BaseTemplateComponent implements OnInit {
  readonly authenticationService = inject(AuthenticationService);
  readonly sharedService = inject(SharedService);
  readonly sideBarService = inject(SideBarService);
  readonly breakpointService = inject(BreakpointService);
  readonly navBarService = inject(NavBarService);
  readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Wired by `<base-template [outlet]="outlet">` in app.component.html. */
  @Input() outlet: RouterOutlet;

  /** Matches table mobile breakpoint (≤767px): no persistent sidebar strip. */
  readonly mobileCardLayout = signal(false);

  /** Full-screen form pages (`…/add`, `…/:id/edit`) have their own bars. */
  readonly onCreatePage = signal(false);

  navigation: MenuItem[];
  sideBarMode: SideBarMode = 'side';

  ngOnInit(): void {
    if (this.sideBarMode === 'over') {
      this.sideBarService.isOpened = false;
    }
    this.breakpointService.useTableCardLayout$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mobile) => this.mobileCardLayout.set(mobile));
    this.getNavigationItems();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncHideSidebarKey();
        // Slightly wider phones scroll the shell's content box, not the
        // window (which the router resets itself): start new pages at the top.
        document.querySelector('.content-container')?.scrollTo(0, 0);
        this.onCreatePage.set(/\/(add|edit)$/.test(this.router.url.split(/[?#]/)[0]));
      });
  }

  get showMobileTabBar(): boolean {
    return this.mobileCardLayout()
      && !!this.authenticationService.currentUserValue
      && this.sideBarService.displaySidebar
      && !this.sideBarService.hiddenByUrl()
      && !this.onCreatePage();
  }

  /** `?hideSidebar` (any value except `false` / `0`) hides the sidebar for that URL. */
  private syncHideSidebarKey(): void {
    const value = this.router.parseUrl(this.router.url).queryParams['hideSidebar'];
    this.sideBarService.hiddenByUrl.set(value !== undefined && value !== 'false' && value !== '0');
  }

  get applicationLeftMargin(): string {
    if (!this.authenticationService.currentUserValue || this.mobileCardLayout()) {
      return '0';
    }
    return this.sideBarMode === 'over' ? '76px' : '0';
  }

  prepareRoute() {
    return this.outlet?.activatedRouteData?.['animation'];
  }

  private getNavigationItems(): void {
    this.http
      .get<MenuItem[]>('assets/navigation.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => (this.navigation = data));
  }

  toggleSidebar(): void {
    this.sideBarService.toggleSideBar();
  }
}
