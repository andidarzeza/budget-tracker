import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { MenuItem, SideBarMode } from '../base-template.models';

/** Horizontal band (in px from the left viewport edge) where a touch
 *  qualifies as an "open" swipe. Starts inset from the very edge so it
 *  doesn't overlap iOS Safari / Android Chrome's native back-swipe zone
 *  (which lives in the first ~15 px). Touches between INNER and OUTER
 *  start the drawer drag; touches at clientX < INNER are left to the
 *  browser's back gesture. */
const EDGE_SWIPE_ZONE_INNER_PX = 30;
const EDGE_SWIPE_ZONE_OUTER_PX = 70;
/** Horizontal movement (in px) required before we commit a touch to the
 *  drawer drag — below this, taps/vertical scrolls pass through. */
const DRAG_COMMIT_THRESHOLD_PX = 8;
/** Drag velocity (px/ms) above which we always flick to the next state
 *  regardless of how far the user dragged. */
const FLICK_VELOCITY_PX_PER_MS = 0.4;

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class SideBarComponent implements OnChanges, AfterViewInit, OnDestroy {
  readonly sharedService = inject(SharedService);
  readonly authenticationService = inject(AuthenticationService);
  readonly sideBarService = inject(SideBarService);
  readonly router = inject(Router);
  private readonly routeSpinnerService = inject(RouteSpinnerService);

  @Input() navigation: MenuItem[];
  @Input() sideBarMode: SideBarMode;
  /** Slides in from the left as a half-width overlay (narrow screens). */
  @Input() mobileDrawer = false;

  selIndex = 1;

  /** Active drag state. Null when the user isn't dragging. */
  private dragState: {
    startX: number;
    currentX: number;
    startedAt: number;
    startedOpen: boolean;
    drawerWidth: number;
    committed: boolean;
  } | null = null;

  private readonly onTouchStart = (e: TouchEvent) => this.handleTouchStart(e);
  private readonly onTouchMove = (e: TouchEvent) => this.handleTouchMove(e);
  private readonly onTouchEnd = () => this.handleTouchEnd();
  private listenersAttached = false;

  ngAfterViewInit(): void {
    if (this.mobileDrawer) {
      this.attachSwipeListeners();
      return;
    }
    this.applyStoredSidebarWidth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mobileDrawer']) {
      this.sideBarService.setDesktopSidebarLayout(!this.mobileDrawer);
      if (this.mobileDrawer) {
        this.attachSwipeListeners();
      } else {
        this.detachSwipeListeners();
        if (!changes['mobileDrawer'].firstChange) {
          this.applyStoredSidebarWidth();
        }
      }
    }
    this.navigation?.forEach((item: MenuItem) => {
      if (item.link === window.location.pathname || window.location.pathname.includes(item.link)) {
        setTimeout(() => {
          this.animateSelectedOption(this.navigation.indexOf(item));
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.detachSwipeListeners();
  }

  private applyStoredSidebarWidth(): void {
    const sideBarStatus = localStorage.getItem('fms-sidebar');
    if (sideBarStatus === 'true') {
      this.sideBarService.isOpened = true;
      this.sideBarService.openSideBar();
    } else {
      this.sideBarService.isOpened = false;
      this.sideBarService.closeSideBar();
    }
  }

  activateSpinner(): void {
    this.routeSpinnerService.startLoading();
  }

  onBrandClick(): void {
    if (this.mobileDrawer) {
      this.sideBarService.closeMobileMenu();
    }
  }

  onNavItemClick(index: number): void {
    this.activateSpinner();
    this.animateSelectedOption(index);
    if (this.mobileDrawer) {
      this.sideBarService.closeMobileMenu();
    }
  }

  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById('active-item') as HTMLElement;
    if (activeItem) {
      const margin = index + 1;
      activeItem.style.transform = `translate(0%, calc(${index * 100}% + ${index * 3 + margin * 3}px))`;
    }
  }

  // ── Swipe-to-open / drag-to-close gestures ─────────────────────────────

  private attachSwipeListeners(): void {
    if (this.listenersAttached) return;
    // `touchmove` is `passive: false` so we can preventDefault during a
    // committed horizontal drag and stop the page from scrolling
    // vertically underneath. Others stay passive for scroll perf.
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('touchcancel', this.onTouchEnd);
    this.listenersAttached = true;
  }

  private detachSwipeListeners(): void {
    if (!this.listenersAttached) return;
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
    this.listenersAttached = false;
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const touch = e.touches[0];
    const isOpen = this.sideBarService.mobileMenuOpen;
    const drawerWidth = sidebar.getBoundingClientRect().width;

    // Closed → only start tracking if the touch lands in the inset edge
    // band. The first ~15 px from the screen edge is reserved for iOS
    // Safari / Android Chrome's native back-swipe (which web code can't
    // override), so we start our zone just outside it. Drag-to-close
    // starts inside the drawer (already on screen) so the OS doesn't
    // claim it — keep that path enabled everywhere.
    const inEdgeZone =
      touch.clientX >= EDGE_SWIPE_ZONE_INNER_PX && touch.clientX <= EDGE_SWIPE_ZONE_OUTER_PX;
    const inOpenDrawer = isOpen && touch.clientX <= drawerWidth;
    if (!inEdgeZone && !inOpenDrawer) {
      return;
    }

    this.dragState = {
      startX: touch.clientX,
      currentX: touch.clientX,
      startedAt: Date.now(),
      startedOpen: isOpen,
      drawerWidth,
      committed: false,
    };
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.dragState) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.dragState.startX;
    const dy = Math.abs(touch.clientY ? touch.clientY - (e.touches[0].clientY) : 0);

    if (!this.dragState.committed) {
      // Wait until the user's intent is clearly horizontal before stealing
      // the gesture. If they're scrolling vertically, abandon the drag.
      if (Math.abs(dx) < DRAG_COMMIT_THRESHOLD_PX) {
        return;
      }
      // If the touch started on the open drawer and the first move is a
      // rightward swing, that's not closing — let the inner scroll handle
      // it instead of stealing it.
      if (this.dragState.startedOpen && dx > 0) {
        this.dragState = null;
        return;
      }
      this.dragState.committed = true;
    }

    e.preventDefault();
    this.dragState.currentX = touch.clientX;
    this.applyDragTransform();
  }

  private applyDragTransform(): void {
    if (!this.dragState) return;
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const dx = this.dragState.currentX - this.dragState.startX;
    const w = this.dragState.drawerWidth;
    // Translate range is [-w, 0]. -w = fully closed, 0 = fully open.
    const base = this.dragState.startedOpen ? 0 : -w;
    const translate = Math.min(0, Math.max(-w, base + dx));

    sidebar.style.transition = 'none';
    sidebar.style.transform = `translate3d(${translate}px, 0, 0)`;

    const backdrop = document.querySelector('.mobile-nav-backdrop') as HTMLElement | null;
    if (backdrop) {
      const progress = (translate + w) / w; // 0 closed → 1 open
      backdrop.style.transition = 'none';
      backdrop.style.opacity = String(progress);
      backdrop.style.pointerEvents = progress > 0.05 ? 'auto' : 'none';
    }
  }

  private handleTouchEnd(): void {
    if (!this.dragState) return;

    const dx = this.dragState.currentX - this.dragState.startX;
    const elapsed = Math.max(1, Date.now() - this.dragState.startedAt);
    const velocity = Math.abs(dx) / elapsed; // px per ms
    const halfWidth = this.dragState.drawerWidth / 2;

    let openAfter: boolean;
    if (this.dragState.startedOpen) {
      // Open → maybe close (leftward drag).
      const flickClose = dx < 0 && velocity >= FLICK_VELOCITY_PX_PER_MS;
      openAfter = !(dx < -halfWidth || flickClose);
    } else {
      // Closed → maybe open (rightward drag).
      const flickOpen = dx > 0 && velocity >= FLICK_VELOCITY_PX_PER_MS;
      openAfter = dx > halfWidth || flickOpen;
    }

    // Drop inline styles so CSS transitions take over the snap.
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.transition = '';
      sidebar.style.transform = '';
    }
    const backdrop = document.querySelector('.mobile-nav-backdrop') as HTMLElement | null;
    if (backdrop) {
      backdrop.style.transition = '';
      backdrop.style.opacity = '';
      backdrop.style.pointerEvents = '';
    }

    if (openAfter !== this.sideBarService.mobileMenuOpen) {
      this.sideBarService.toggleMobileMenu();
    }

    this.dragState = null;
  }
}
