import { HapticTapDirective } from 'src/app/shared/haptic-tap/haptic-tap.directive';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, NgZone, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval, startWith } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  imports: [HapticTapDirective, CommonModule, MatDividerModule, MatIconModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent implements OnInit {
  readonly authenticationService = inject(AuthenticationService);
  readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointService);
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

  ngOnInit(): void {
    // The menu shows HH:mm — only update (and re-render) when the minute changes.
    interval(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const now = new Date();
        if (now.getMinutes() !== this.now().getMinutes()) this.now.set(now);
      });
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
  }

  /** Title of the deepest known route segment ("/expenses/add" → "Add"). */
  private titleFor(url: string): string {
    const segments = url.split(/[?#]/)[0].split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return last ? this.labelForSegment(last) : '';
  }

  /**
   * Pages scroll inside the shell's `.content-container` (scroll events
   * don't bubble, so a capturing listener on the document picks them up).
   * Other scrollers — sheets, horizontal chip rows — are ignored. Runs
   * outside Angular so scrolling doesn't trigger change detection; only the
   * (rare) flips of `scrolled` re-enter the zone.
   */
  private watchScroll(): void {
    const onScroll = (e: Event) => {
      const target = e.target as Element | Document;
      if (target instanceof Element && !target.classList.contains('content-container')) return;
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

  logout(): void {
    this.authenticationService.logout();
  }

  get firstName() {
    return this.authenticationService?.currentUserValue?.firstName;
  }

  get lastName() {
    return this.authenticationService?.currentUserValue?.lastName;
  }
}

