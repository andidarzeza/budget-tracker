import { Directive, ElementRef, EventEmitter, inject, Input, NgZone, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FeedbackService } from 'src/app/services/feedback.service';

/** How far (after resistance) the page must be pulled to refresh on release. */
const TRIGGER_PX = 70;
/** Where the page rests while the refresh runs (room for the spinner). */
const HOLD_PX = 56;
/** Safety net if `refreshing` never turns back off. */
const MAX_REFRESH_MS = 10000;

/**
 * iOS pull-to-refresh for phone pages: with the page scrolled to the top,
 * pull down to reveal the activity indicator; past the threshold a tick, and
 * letting go emits `refresh`. The page rests open while `[refreshing]` is
 * true, then settles back. Phones only (≤767px); desktop has the toolbar.
 *
 *   <section pullToRefresh [refreshing]="loading()" (refresh)="refresh()">
 */
@Directive({
  selector: '[pullToRefresh]',
})
export class PullToRefreshDirective implements OnInit, OnChanges, OnDestroy {
  /** True while the refresh is running; the indicator stays until it's false. */
  @Input() refreshing = false;
  @Output() readonly refresh = new EventEmitter<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly feedback = inject(FeedbackService);

  private indicator: HTMLElement | null = null;
  private startY = 0;
  private pulling = false;
  private armed = false;
  private distance = 0;
  private busy = false;
  private sawRefreshing = false;
  private safety: ReturnType<typeof setTimeout> | null = null;

  private readonly onStart = (e: TouchEvent) => {
    if (this.busy || e.touches.length !== 1 || !isPhone() || scrollTop() > 0) return;
    this.startY = e.touches[0].clientY;
    this.pulling = true;
    this.armed = false;
    this.distance = 0;
  };

  private readonly onMove = (e: TouchEvent) => {
    if (!this.pulling) return;
    const dy = e.touches[0].clientY - this.startY;
    if (dy <= 0 || scrollTop() > 0) {
      if (this.distance > 0) this.render(0, false);
      if (dy < 0) this.pulling = false; // scrolling down the page: not a pull
      return;
    }
    // Ours now: stop iOS's own rubber-band from moving the page as well.
    if (e.cancelable) e.preventDefault();
    this.distance = Math.min(140, dy * 0.5);
    this.render(this.distance, false);
    const armed = this.distance >= TRIGGER_PX;
    if (armed !== this.armed) {
      this.armed = armed;
      if (armed) this.feedback.haptic('light');
    }
  };

  private readonly onEnd = () => {
    if (!this.pulling) return;
    this.pulling = false;
    if (this.armed) {
      this.feedback.hapticOnRelease('light');
      this.startRefresh();
    } else if (this.distance > 0) {
      this.render(0, true);
    }
  };

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      // Non-passive move: it must be able to cancel the native bounce.
      this.host.addEventListener('touchstart', this.onStart, { passive: true });
      this.host.addEventListener('touchmove', this.onMove, { passive: false });
      this.host.addEventListener('touchend', this.onEnd, { passive: true });
      this.host.addEventListener('touchcancel', this.onEnd, { passive: true });
    });
  }

  ngOnChanges(): void {
    if (this.refreshing) {
      this.sawRefreshing = true;
    } else if (this.busy && this.sawRefreshing) {
      this.finish();
    }
  }

  ngOnDestroy(): void {
    if (this.safety) clearTimeout(this.safety);
    this.host.removeEventListener('touchstart', this.onStart);
    this.host.removeEventListener('touchmove', this.onMove);
    this.host.removeEventListener('touchend', this.onEnd);
    this.host.removeEventListener('touchcancel', this.onEnd);
    this.indicator?.remove();
    this.host.style.transform = '';
  }

  private startRefresh(): void {
    this.busy = true;
    this.sawRefreshing = false;
    this.render(HOLD_PX, true);
    this.indicator?.classList.add('ptr-indicator--spinning');
    this.zone.run(() => this.refresh.emit());
    // Data that answers instantly (from the cache) may never flip `refreshing`:
    // keep the spinner up a moment so the refresh still reads as one.
    setTimeout(() => {
      if (this.busy && !this.refreshing) this.finish();
    }, 700);
    this.safety = setTimeout(() => this.finish(), MAX_REFRESH_MS);
  }

  private finish(): void {
    if (!this.busy) return;
    this.busy = false;
    if (this.safety) clearTimeout(this.safety);
    this.safety = null;
    this.render(0, true);
    setTimeout(() => this.indicator?.classList.remove('ptr-indicator--spinning'), 300);
  }

  /** Move the page down by `y` and grow the spinner in the gap above it. */
  private render(y: number, animate: boolean): void {
    const indicator = this.ensureIndicator();
    const ease = 'cubic-bezier(0.2, 0.9, 0.25, 1)';
    this.host.style.transition = animate ? `transform 0.35s ${ease}` : 'none';
    this.host.style.transform = y ? `translateY(${y}px)` : '';
    indicator.style.transition = animate ? `opacity 0.25s ease, transform 0.35s ${ease}` : 'none';
    const progress = Math.min(1, y / TRIGGER_PX);
    indicator.style.opacity = String(progress);
    // Before release the spokes turn with the pull (like UIRefreshControl).
    // The indicator rides along inside the page, so lift it back into the
    // middle of the gap the pull opened above the page (spinner is 30px tall).
    indicator.style.transform = `translateX(-50%) translateY(${-y / 2 - 15}px) rotate(${progress * 270}deg)`;
  }

  /** The iOS activity indicator, placed above the host's top edge. */
  private ensureIndicator(): HTMLElement {
    if (this.indicator) return this.indicator;
    const el = document.createElement('div');
    el.className = 'ptr-indicator';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="app-spinner"><span class="app-spinner__arc"></span></span>';
    this.host.prepend(el);
    this.indicator = el;
    return el;
  }
}

function isPhone(): boolean {
  return window.matchMedia?.('(max-width: 767px)').matches ?? false;
}

/** Pages scroll inside the shell's content box (the window only as a fallback). */
function scrollTop(): number {
  const box = document.querySelector('.content-container');
  return Math.max(window.scrollY, box?.scrollTop ?? 0);
}
