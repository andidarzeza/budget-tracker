import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IConfiguration } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { environment } from 'src/environments/environment';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol/currency-symbol.pipe';
import { FlagPipe } from '../../pipes/flag-pipe/flag.pipe';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
    IconButtonComponent,
    FlagPipe,
    CurrencySymbolPipe,
    ...TOOLTIP_IMPORTS,
  ],
})
export class NavBarComponent implements OnInit {
  readonly sharedService = inject(SharedService);
  readonly authenticationService = inject(AuthenticationService);
  readonly sidebarService = inject(SideBarService);
  readonly themeService = inject(ThemeService);
  readonly accountService = inject(AccountService);
  readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Same breakpoint as mobile table cards (≤767px). */
  readonly isMobileLayout = signal(false);

  /** Pixels the toolbar's left edge needs to clear so it doesn't sit behind
   *  the sidebar (which stacks above the navbar's parent stacking context). */
  readonly sidebarOffset = signal(0);

  /** Breadcrumb trail derived from the current router URL.
   *  Shown only on desktop to fill the navbar's left side. */
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  /** Wall-clock time + browser-derived city for the navbar user chip. */
  readonly now = signal(new Date());
  readonly location = computed(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tail = tz.split('/').pop() || '';
      return tail.replace(/_/g, ' ') || 'Local';
    } catch {
      return 'Local';
    }
  });

  configuration: IConfiguration;
  readonly EXPERIMENTAL_MODE = environment.experimentalMode;

  ngOnInit(): void {
    this.clearLegacyAccentOverride();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(new Date()));
    this.breakpointService.useTableCardLayout$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mobile) => this.isMobileLayout.set(mobile));
    this.sidebarService.currentWidth$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((width) => this.sidebarOffset.set(width));
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.breadcrumbs.set(this.buildBreadcrumbs(this.router.url)));
    this.configurationService
      .getConfiguration()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.applyBodyTheme(this.themeService.themeValue);
      });
  }

  /** Maps URL segments to a clickable breadcrumb trail. The first crumb is
   *  always Home (→ /welcome) so users can jump out of any flow. Numeric / UUID
   *  segments are labeled as "Detail" since we don't have entity names here. */
  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const path = url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return [];

    const crumbs: Breadcrumb[] = [{ label: 'Home', link: '/welcome' }];
    let accumulated = '';
    for (const segment of segments) {
      accumulated += `/${segment}`;
      crumbs.push({ label: this.labelForSegment(segment), link: accumulated });
    }
    return crumbs;
  }

  private labelForSegment(segment: string): string {
    const known: Record<string, string> = {
      welcome: 'Home',
      dashboard: 'Dashboard',
      expenses: 'Expenses',
      incomes: 'Incomes',
      categories: 'Categories',
      projects: 'Projects',
      history: 'History',
      settings: 'Settings',
      account: 'Account',
      add: 'Add',
    };
    if (known[segment]) return known[segment];
    // Project detail / similar id-only segments.
    if (/^[0-9a-f-]{8,}$/i.test(segment)) return 'Detail';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  /**
   * The legacy theme picker wrote `--light` / `--lightShadowed` overrides
   * onto :root and persisted them in `themeColor` localStorage. The new
   * indigo design system owns those tokens through .light-theme/.dark-theme,
   * so any leftover override would shadow the accent. Drop both once.
   */
  private clearLegacyAccentOverride(): void {
    if (localStorage.getItem('themeColor')) {
      localStorage.removeItem('themeColor');
    }
    const root = document.documentElement;
    root.style.removeProperty('--light');
    root.style.removeProperty('--lightShadowed');
  }

  logout(): void {
    this.authenticationService.logout();
  }

  switchAccount(): void {
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  toggleDarkMode(): void {
    this.themeService.changeTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
  }

  get firstName() {
    return this.authenticationService?.currentUserValue?.firstName;
  }

  get lastName() {
    return this.authenticationService?.currentUserValue?.lastName;
  }
}

interface Breadcrumb {
  label: string;
  link: string;
}
