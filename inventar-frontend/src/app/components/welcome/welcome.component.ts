import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, interval, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NewsItem {
  badge: string;
  badgeTone: 'new' | 'faster' | 'beta';
  date: string;
  title: string;
  url?: string;
}

interface HnStory {
  id: number;
  title: string;
  url?: string;
  time: number;
  type: string;
  score: number;
}

interface NewsCache {
  date: string;
  items: NewsItem[];
}

const NEWS_CACHE_KEY = 'welcome_news_v1';
const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

/** Fallback when the API is unreachable AND no cache is available
    (first-ever load, offline). */
const FALLBACK_NEWS: readonly NewsItem[] = [
  {
    badge: 'NEW',
    badgeTone: 'new',
    date: '',
    title: "Welcome — we'll fetch fresh headlines once you're online.",
  },
];

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatTooltipModule],
})
export class WelcomeComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly navBarService = inject(NavBarService);
  private readonly sideBarService = inject(SideBarService);
  readonly themeService = inject(ThemeService);
  private readonly sharedService = inject(SharedService);
  /**
   * Plain HttpClient built on the raw backend so the auth interceptor does
   * NOT run for external calls (Hacker News). Otherwise our JWT gets sent to
   * Firebase, which rejects it with 401, which the interceptor catches and
   * treats as a session expiry — bouncing the user to /login right after
   * they signed in.
   */
  private readonly http = new HttpClient(inject(HttpBackend));

  readonly now = signal(new Date());

  /** "Europe/Tirana" → "Tirana". Falls back to "Local" when the platform
      reports a UTC offset or unparseable zone. */
  readonly location = computed(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tail = tz.split('/').pop() || '';
      return tail.replace(/_/g, ' ') || 'Local';
    } catch {
      return 'Local';
    }
  });

  readonly tzAbbrev = computed(() => {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZoneName: 'short',
    }).formatToParts(this.now());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  });

  /** Headlines from Hacker News, refreshed at most once per calendar day. */
  readonly news = signal<readonly NewsItem[]>([]);

  get firstName(): string {
    return this.auth.currentUserValue?.firstName || '';
  }

  get lastName(): string {
    return this.auth.currentUserValue?.lastName || '';
  }

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  get initials(): string {
    const u = this.auth.currentUserValue;
    const f = (u?.firstName || '').trim().charAt(0).toUpperCase();
    const l = (u?.lastName || '').trim().charAt(0).toUpperCase();
    return `${f}${l}`;
  }

  get greeting(): string {
    const h = this.now().getHours();
    if (h < 5) return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  ngOnInit(): void {
    // Welcome page renders its own header (status pill + user chip) and a
    // full-bleed background; the app shell would only get in the way.
    this.navBarService.displayNavBar = false;
    this.sideBarService.displaySidebar = false;

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(new Date()));

    this.loadNews();
  }

  toggleDarkMode(): void {
    this.themeService.changeTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
  }

  logout(): void {
    this.auth.logout();
  }

  switchAccount(): void {
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Hacker News API: pull the top-stories ID list, take the first three
   * non-job items, fetch each in parallel. Result is cached in localStorage
   * keyed by today's date so the welcome page only hits the network once
   * per calendar day, regardless of how often it's reopened.
   */
  private loadNews(): void {
    const today = this.todayKey();
    const cached = this.readCache();
    if (cached && cached.date === today && cached.items.length > 0) {
      this.news.set(cached.items);
      return;
    }

    this.http
      .get<number[]>(`${HN_BASE}/topstories.json`)
      .pipe(
        // Grab more than 3 in case some are job posts or fetch errors.
        map((ids) => (ids || []).slice(0, 10)),
        switchMap((ids) =>
          forkJoin(
            ids.map((id) =>
              this.http
                .get<HnStory>(`${HN_BASE}/item/${id}.json`)
                .pipe(catchError(() => of(null as HnStory | null))),
            ),
          ),
        ),
        map((stories) => this.toNewsItems(stories)),
        catchError(() => of<NewsItem[]>([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        if (items.length > 0) {
          this.news.set(items);
          this.writeCache({ date: today, items });
        } else if (cached?.items.length) {
          // Network failed but yesterday's cache is better than nothing.
          this.news.set(cached.items);
        } else {
          this.news.set(FALLBACK_NEWS);
        }
      });
  }

  private toNewsItems(stories: (HnStory | null)[]): NewsItem[] {
    const tones: NewsItem['badgeTone'][] = ['faster', 'beta', 'new'];
    const badges = ['TOP', 'HOT', 'NEW'];
    return stories
      .filter((s): s is HnStory => !!s && s.type === 'story' && !!s.title)
      .slice(0, 3)
      .map((s, i) => ({
        badge: badges[i],
        badgeTone: tones[i],
        date: this.formatDate(s.time),
        title: s.title,
        // External link if the story points at an article, otherwise the HN
        // discussion page itself.
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
      }));
  }

  private formatDate(unixSec: number): string {
    const d = new Date(unixSec * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  private readCache(): NewsCache | null {
    try {
      const raw = localStorage.getItem(NEWS_CACHE_KEY);
      return raw ? (JSON.parse(raw) as NewsCache) : null;
    } catch {
      return null;
    }
  }

  private writeCache(value: NewsCache): void {
    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(value));
    } catch {
      /* quota exhausted / private mode — non-fatal */
    }
  }
}
