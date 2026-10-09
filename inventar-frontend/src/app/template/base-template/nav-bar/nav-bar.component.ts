import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, NgZone, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval, startWith } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router } from '@angular/router';
import { IConfiguration } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  imports: [CommonModule, MatDividerModule, MatIconModule, MatMenuModule],
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
  private readonly zone = inject(NgZone);

  /** Same breakpoint as mobile table cards (≤767px). */
  readonly isMobileLayout = signal(false);


  /** Small centred title, shown once the page's large title scrolls away. */
  readonly pageTitle = signal('');

  /** True once the content has scrolled under the bar (switches it to glass). */
  readonly scrolled = signal(false);

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
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.pageTitle.set(this.titleFor(this.router.url));
        this.scrolled.set(false);
      });
    this.watchScroll();
    this.configurationService
      .getConfiguration()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.applyBodyTheme(this.themeService.themeValue);
      });
  }

  /** Title of the deepest known route segment ("/expenses/add" → "Add"). */
  private titleFor(url: string): string {
    const segments = url.split(/[?#]/)[0].split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return last ? this.labelForSegment(last) : '';
  }

  /**
   * Phones scroll the window; slightly wider screens scroll the shell's
   * `.content-container`. A capturing listener on the document sees both.
   * Runs outside Angular so scrolling doesn't trigger change detection;
   * only the (rare) flips of `scrolled` re-enter the zone.
   */
  private watchScroll(): void {
    const onScroll = (e: Event) => {
      const target = e.target as Element | Document;
      const top = target instanceof Element ? target.scrollTop : window.scrollY;
      const next = top > 44;
      if (next !== this.scrolled()) this.zone.run(() => this.scrolled.set(next));
    };
    this.zone.runOutsideAngular(() => document.addEventListener('scroll', onScroll, { capture: true, passive: true }));
    this.destroyRef.onDestroy(() => document.removeEventListener('scroll', onScroll, { capture: true }));
  }

  private labelForSegment(segment: string): string {
    const known: Record<string, string> = {
      welcome: 'Home',
      dashboard: 'Summary',
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

