import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { slider } from 'src/app/animations';
import { inOutAnimation } from 'src/app/components/settings/dynamic-dropdown/animations';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { MenuItem, SideBarMode } from './base-template.models';


@Component({
  selector: 'base-template',
  templateUrl: './base-template.component.html',
  styleUrls: ['./base-template.component.css'],
  imports: [CommonModule, NavBarComponent, SideBarComponent],
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
  private readonly destroyRef = inject(DestroyRef);

  /** Wired by `<base-template [outlet]="outlet">` in app.component.html. */
  @Input() outlet: RouterOutlet;

  /** Matches table mobile breakpoint (≤767px): no persistent sidebar strip. */
  readonly mobileCardLayout = signal(false);

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
