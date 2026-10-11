import { HapticTapDirective } from 'src/app/shared/haptic-tap/haptic-tap.directive';
import { FeedbackService } from 'src/app/services/feedback.service';
import { PinkToggleComponent } from 'src/app/shared/pink-toggle/pink-toggle.component';
import { ChangeDetectionStrategy, AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitchComponent } from 'src/app/shared/theme-switch/theme-switch.component';

interface TabItem {
  label: string;
  icon: string;
  link: string;
}

/** Sideways finger travel (px) before a press on the tab bar becomes a
 *  slide — generous, so a normal tap's wobble is still a tap. */
const SLIDE_THRESHOLD_PX = 14;

interface MoreItem {
  label: string;
  icon: string;
  link: string;
  /** iOS system colour for the icon square, as in the menu drawer. */
  color: string;
}

/** Thumb-reach navigation pinned to the bottom of the screen on phones. */
@Component({
  selector: 'mobile-tab-bar',
  templateUrl: './mobile-tab-bar.component.html',
  styleUrls: ['./mobile-tab-bar.component.css'],
  imports: [HapticTapDirective, PinkToggleComponent, MatIconModule, RouterLink, RouterLinkActive, ThemeSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileTabBarComponent implements AfterViewInit {
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Current path as a signal, so the active tab re-renders after navigation. */
  private readonly path = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );

  /** The "More" popup that floats above its tab. */
  readonly moreOpen = signal(false);

  /** Tabs with their own page; "More" is the fourth slot. */
  readonly tabs: readonly TabItem[] = [
    { label: 'Summary', icon: 'space_dashboard', link: '/dashboard' },
    { label: 'Expenses', icon: 'trending_down', link: '/expenses' },
    { label: 'Incomes', icon: 'trending_up', link: '/incomes' },
  ];
  readonly moreIndex = this.tabs.length;

  /** Slot under the finger while sliding across the bar (iOS 26 style). */
  readonly slideIndex = signal<number | null>(null);
  private slide: { startX: number; startY: number; sliding: boolean } | null = null;
  private swallowClick = false;
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');

  ngAfterViewInit(): void {
    // Capture phase, so it runs before the button under the finger.
    this.bar()?.nativeElement.addEventListener('click', (e) => this.onClickCapture(e), true);

    // iOS home-screen app: after moving from a long, scrolled page to a short
    // one, the bar's compositing layer can stay where it was. Re-create it
    // once the new page has laid out so it snaps back to the screen bottom.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => requestAnimationFrame(() => requestAnimationFrame(() => this.repinDock())));
  }

  private repinDock(): void {
    const dock = this.hostEl.nativeElement.querySelector<HTMLElement>('.dock');
    if (!dock) return;
    dock.style.transform = 'none';
    void dock.offsetHeight; // force the style to apply before restoring it
    dock.style.transform = '';
  }

  /** Pages that don't have their own tab. */
  readonly moreItems: readonly MoreItem[] = [
    { label: 'Home', icon: 'home', link: '/welcome', color: '#8e8e93' },
    { label: 'Categories', icon: 'category', link: '/categories', color: '#ff9500' },
    { label: 'Projects', icon: 'savings', link: '/projects', color: '#af52de' },
    { label: 'Exchange', icon: 'currency_exchange', link: '/exchange', color: '#30b0c7' },
    { label: 'History', icon: 'history', link: '/history', color: '#5856d6' },
    { label: 'Settings', icon: 'settings', link: '/settings', color: '#8e8e93' },
  ];

  /** Highlights "More" while one of its pages is showing. */
  get onMorePage(): boolean {
    const path = this.path();
    return this.moreItems.some((i) => path === i.link || path.startsWith(i.link + '/'));
  }

  /** Opens the routed full-screen create form, same as "New" on the expenses page. */
  addExpense(): void {
    this.closeAll();
    this.router.navigate(['/expenses/add']);
  }

  isActive(tab: TabItem): boolean {
    const path = this.path();
    return path === tab.link;
  }

  /** Tap: open the tab; tapping the tab you're on scrolls back to the top. */
  openTab(tab: TabItem): void {
    this.closeAll();
    if (this.isActive(tab)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('.content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.router.navigate([tab.link]);
  }

  // ── Slide across the bar, release to open (iOS 26 tab bar) ─────────────

  /** "More" item under the finger while a press is dragged up into the menu. */
  readonly menuSlideIndex = signal<number | null>(null);
  /** The menu was opened by the current press (press on More, or a slide onto it). */
  private menuFromPress = false;

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const bar = event.currentTarget as HTMLElement;
    // A fresh touch is never the tail of an earlier slide.
    this.swallowClick = false;
    this.menuFromPress = false;
    this.slide = { startX: event.clientX, startY: event.clientY, sliding: false };
    // Touching More opens the menu at once (a closed one — tapping More again
    // still closes it); keep the pointer, so the finger can carry on up into it.
    if (this.slotAt(event.clientX, bar) === this.moreIndex && !this.moreOpen()) {
      this.openMenuFromPress(event, bar);
      this.swallowClick = true; // the click on More would toggle it shut again
    }
  }

  onPointerMove(event: PointerEvent, bar: HTMLElement): void {
    if (!this.slide) return;
    const barTop = bar.getBoundingClientRect().top;
    // Above the bar with the menu open: pick the page under the finger.
    if (this.moreOpen() && this.menuFromPress && event.clientY < barTop - 4) {
      this.slideIndex.set(null);
      const index = this.menuItemAt(event.clientX, event.clientY);
      if (index !== this.menuSlideIndex()) {
        if (index !== null) this.feedback.haptic('selection');
        this.menuSlideIndex.set(index);
      }
      return;
    }
    this.menuSlideIndex.set(null);
    if (!this.slide.sliding) {
      const dx = Math.abs(event.clientX - this.slide.startX);
      const dy = Math.abs(event.clientY - this.slide.startY);
      if (!this.menuFromPress && (dx < SLIDE_THRESHOLD_PX || dx < dy)) return;
      if (this.menuFromPress && dx < SLIDE_THRESHOLD_PX) return;
      this.slide.sliding = true;
      this.capture(bar, event.pointerId);
    }
    const index = this.slotAt(event.clientX, bar);
    // A tick each time the finger crosses into another tab (UISelectionFeedback).
    if (index !== this.slideIndex()) this.feedback.haptic('selection');
    this.slideIndex.set(index);
    // Sliding onto More opens the menu; sliding off it again closes it.
    if (index === this.moreIndex && !this.moreOpen()) {
      this.openMenuFromPress(event, bar);
    } else if (index !== this.moreIndex && this.moreOpen() && this.menuFromPress) {
      this.moreOpen.set(false);
    }
  }

  onPointerUp(event: PointerEvent, bar: HTMLElement): void {
    const slide = this.slide;
    this.slide = null;
    const menuIndex = this.menuSlideIndex();
    this.menuSlideIndex.set(null);
    // Released on a page in the menu: open it.
    if (menuIndex !== null) {
      this.feedback.hapticOnRelease('selection');
      this.swallowClick = true;
      setTimeout(() => (this.swallowClick = false), 350);
      this.closeAll();
      this.router.navigate([this.moreItems[menuIndex].link]);
      return;
    }
    // A press on More that opened the menu: its tick, now that the finger lifts.
    if (this.menuFromPress && !slide?.sliding) this.feedback.hapticOnRelease('light');
    if (!slide?.sliding) return;
    const index = this.slotAt(event.clientX, bar);
    this.slideIndex.set(null);
    this.feedback.hapticOnRelease('selection');
    // The release may also fire a click on whatever is under the finger;
    // ignore it — but only briefly, so it can never eat a later real tap.
    this.swallowClick = true;
    setTimeout(() => (this.swallowClick = false), 350);
    if (event.clientY < bar.getBoundingClientRect().top - 4 && this.moreOpen()) {
      return; // let go above the bar, not on a page: the menu stays open
    }
    if (index === this.moreIndex) {
      this.moreOpen.set(true);
    } else {
      this.openTab(this.tabs[index]);
    }
  }

  onPointerCancel(): void {
    this.slide = null;
    this.slideIndex.set(null);
    this.menuSlideIndex.set(null);
  }

  private menuOpenedAt = 0;

  /** Tap outside the menu closes it — but not the click that ends the very press that opened it. */
  closeFromBackdrop(): void {
    if (performance.now() - this.menuOpenedAt < 450) return;
    this.moreOpen.set(false);
  }

  private openMenuFromPress(event: PointerEvent, bar: HTMLElement): void {
    this.menuOpenedAt = performance.now();
    this.moreOpen.set(true);
    this.menuFromPress = true;
    this.capture(bar, event.pointerId);
    this.feedback.haptic('light');
  }

  /** Keep getting this finger's moves even once it leaves the bar. */
  private capture(bar: HTMLElement, pointerId: number): void {
    try {
      bar.setPointerCapture(pointerId);
    } catch {
      /* pointer already released */
    }
  }

  /** Index of the More page under a point, or null. */
  private menuItemAt(x: number, y: number): number | null {
    const item = document.elementFromPoint(x, y)?.closest('.more-menu__item');
    if (!item) return null;
    const items = Array.from(document.querySelectorAll('.more-menu__item'));
    const index = items.indexOf(item);
    return index >= 0 ? index : null;
  }

  /** Eats the click that follows a slide, so it doesn't open a second tab. */
  onClickCapture(event: MouseEvent): void {
    if (!this.swallowClick) return;
    this.swallowClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  private slotAt(clientX: number, bar: HTMLElement): number {
    const rect = bar.getBoundingClientRect();
    const slots = this.tabs.length + 1;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width - 1);
    return Math.floor((x / rect.width) * slots);
  }

  toggleMore(): void {
    this.moreOpen.update((open) => !open);
  }

  closeAll(): void {
    this.moreOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.moreOpen.set(false);
  }
}
