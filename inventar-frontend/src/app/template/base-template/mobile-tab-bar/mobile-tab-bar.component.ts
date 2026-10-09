import { PinkToggleComponent } from 'src/app/shared/pink-toggle/pink-toggle.component';
import { AfterViewInit, Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  imports: [PinkToggleComponent, MatIconModule, RouterLink, RouterLinkActive, ThemeSwitchComponent],
})
export class MobileTabBarComponent implements AfterViewInit {
  private readonly router = inject(Router);

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
    const path = this.router.url.split(/[?#]/)[0];
    return this.moreItems.some((i) => path === i.link || path.startsWith(i.link + '/'));
  }

  /** Opens the routed full-screen create form, same as "New" on the expenses page. */
  addExpense(): void {
    this.closeAll();
    this.router.navigate(['/expenses/add']);
  }

  isActive(tab: TabItem): boolean {
    const path = this.router.url.split(/[?#]/)[0];
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

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // A fresh touch is never the tail of an earlier slide.
    this.swallowClick = false;
    this.slide = { startX: event.clientX, startY: event.clientY, sliding: false };
  }

  onPointerMove(event: PointerEvent, bar: HTMLElement): void {
    if (!this.slide) return;
    if (!this.slide.sliding) {
      const dx = Math.abs(event.clientX - this.slide.startX);
      const dy = Math.abs(event.clientY - this.slide.startY);
      if (dx < SLIDE_THRESHOLD_PX || dx < dy) return;
      this.slide.sliding = true;
      bar.setPointerCapture(event.pointerId);
    }
    this.slideIndex.set(this.slotAt(event.clientX, bar));
  }

  onPointerUp(event: PointerEvent, bar: HTMLElement): void {
    const slide = this.slide;
    this.slide = null;
    if (!slide?.sliding) return;
    const index = this.slotAt(event.clientX, bar);
    this.slideIndex.set(null);
    // The release may also fire a click on whatever is under the finger;
    // ignore it — but only briefly, so it can never eat a later real tap.
    this.swallowClick = true;
    setTimeout(() => (this.swallowClick = false), 350);
    navigator.vibrate?.(8);
    if (index === this.moreIndex) {
      this.moreOpen.set(true);
    } else {
      this.openTab(this.tabs[index]);
    }
  }

  onPointerCancel(): void {
    this.slide = null;
    this.slideIndex.set(null);
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
