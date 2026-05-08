import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';

/**
 * iOS-style edge swipe gesture for opening a left drawer (and closing it
 * with a leftward swipe when open).
 *
 * Listens to touch events on `document` outside the Angular zone so we
 * don't trigger change detection on every touchmove. Only commits to
 * Angular when the gesture actually completes (open / close emitted).
 *
 * Usage:
 *   <div appEdgeSwipe
 *        [drawerOpen]="(svc.mobileMenuOpen$ | async) === true"
 *        (openDrawer)="svc.openMobileMenu()"
 *        (closeDrawer)="svc.closeMobileMenu()">
 *
 * Notes on iOS Safari: the system back-swipe-from-edge is hardcoded by
 * iOS and can't be overridden by web content. We use a small inset
 * (`EDGE_OPEN_ZONE`) rather than the screen edge so we don't fight that
 * gesture; users who want to navigate back can start from the very edge,
 * users who want to open the drawer start a few pixels in.
 */
@Directive({
  standalone: false,
  selector: '[appEdgeSwipe]',
})
export class EdgeSwipeDirective implements AfterViewInit, OnDestroy {
  /** Whether the drawer is currently open. Drives the close-swipe path. */
  @Input() drawerOpen = false;

  @Output() openDrawer = new EventEmitter<void>();
  @Output() closeDrawer = new EventEmitter<void>();

  /** A touchstart with `clientX <= EDGE_OPEN_ZONE` qualifies as an edge swipe. */
  private static readonly EDGE_OPEN_ZONE = 28;
  /** Minimum horizontal distance (px) to commit the gesture. */
  private static readonly COMMIT_DISTANCE = 70;
  /** Maximum vertical drift (px) before we treat the gesture as a vertical scroll and bail. */
  private static readonly MAX_VERTICAL_DRIFT = 60;
  /** Maximum gesture duration (ms) — keeps slow accidental drags from triggering. */
  private static readonly MAX_DURATION = 600;

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  /** Set on touchstart; cleared on touchend so we ignore touches we didn't claim. */
  private tracking = false;

  private cleanupFns: Array<() => void> = [];

  constructor(
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const onStart = (e: TouchEvent) => this.onTouchStart(e);
      const onEnd = (e: TouchEvent) => this.onTouchEnd(e);
      const onCancel = () => {
        this.tracking = false;
      };

      this.document.addEventListener('touchstart', onStart, { passive: true });
      this.document.addEventListener('touchend', onEnd, { passive: true });
      this.document.addEventListener('touchcancel', onCancel, { passive: true });

      this.cleanupFns.push(
        () => this.document.removeEventListener('touchstart', onStart),
        () => this.document.removeEventListener('touchend', onEnd),
        () => this.document.removeEventListener('touchcancel', onCancel),
      );
    });
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }

  private onTouchStart(event: TouchEvent): void {
    // Multi-touch (e.g. pinch) — don't try to interpret as a swipe.
    if (event.touches.length !== 1) {
      this.tracking = false;
      return;
    }
    const t = event.touches[0];
    this.startX = t.clientX;
    this.startY = t.clientY;
    this.startTime = performance.now();

    if (this.drawerOpen) {
      // Drawer is open — any single-finger swipe can close it.
      this.tracking = true;
      return;
    }

    // Drawer is closed — only edge swipes count.
    this.tracking = t.clientX <= EdgeSwipeDirective.EDGE_OPEN_ZONE;
  }

  private onTouchEnd(event: TouchEvent): void {
    if (!this.tracking) return;
    this.tracking = false;

    const t = event.changedTouches[0];
    if (!t) return;

    const deltaX = t.clientX - this.startX;
    const deltaY = Math.abs(t.clientY - this.startY);
    const duration = performance.now() - this.startTime;

    if (deltaY > EdgeSwipeDirective.MAX_VERTICAL_DRIFT) return;
    if (duration > EdgeSwipeDirective.MAX_DURATION) return;

    if (this.drawerOpen) {
      if (deltaX < -EdgeSwipeDirective.COMMIT_DISTANCE) {
        this.zone.run(() => this.closeDrawer.emit());
      }
    } else {
      if (deltaX > EdgeSwipeDirective.COMMIT_DISTANCE) {
        this.zone.run(() => this.openDrawer.emit());
      }
    }
  }
}
