import { Directive, ElementRef, EventEmitter, inject, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;
/** Height of the pill plus the gap between it and the lifted row. */
const PILL_SPACE_PX = 56;

/**
 * iOS-style delete on mobile ledger rows. Holding a row lifts a copy of it
 * above a dimmed, blurred screen with a floating "Delete" pill next to it.
 * Tapping the pill emits `deleteRequested`; tapping anywhere else cancels.
 * The release that ends the hold never reaches the row's own click handler
 * (which opens the edit form).
 */
@Directive({
  selector: '[longPressDelete]',
})
export class LongPressDeleteDirective implements OnInit, OnDestroy {
  @Output() readonly deleteRequested = new EventEmitter<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private start = { x: 0, y: 0 };
  private swallowNextClick = false;
  private overlay: HTMLElement | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.swallowNextClick = false;
    this.start = { x: e.clientX, y: e.clientY };
    this.clearTimer();
    // The row sinks slightly while held (iOS press feedback); a quick tap
    // is over before this kicks in, so taps don't flicker.
    this.pressTimer = setTimeout(() => this.host.classList.add('ledger-item--pressing'), 120);
    this.timer = setTimeout(() => this.open(), HOLD_MS);
  };

  private readonly onPointerMove = (e: PointerEvent) => {
    if (this.timer && Math.hypot(e.clientX - this.start.x, e.clientY - this.start.y) > MOVE_TOLERANCE_PX) {
      this.clearTimer();
    }
  };

  private readonly onPointerEnd = () => this.clearTimer();

  private readonly onClickCapture = (e: MouseEvent) => {
    if (!this.swallowNextClick) return;
    e.stopPropagation();
    e.preventDefault();
    this.swallowNextClick = false;
  };

  /** Stops the browser's own long-press menu. */
  private readonly onContextMenu = (e: Event) => e.preventDefault();

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('pointerdown', this.onPointerDown);
      this.host.addEventListener('pointermove', this.onPointerMove);
      this.host.addEventListener('pointerup', this.onPointerEnd);
      this.host.addEventListener('pointercancel', this.onPointerEnd);
      this.host.addEventListener('pointerleave', this.onPointerEnd);
      this.host.addEventListener('click', this.onClickCapture, true);
      this.host.addEventListener('contextmenu', this.onContextMenu);
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.close();
    this.host.removeEventListener('pointerdown', this.onPointerDown);
    this.host.removeEventListener('pointermove', this.onPointerMove);
    this.host.removeEventListener('pointerup', this.onPointerEnd);
    this.host.removeEventListener('pointercancel', this.onPointerEnd);
    this.host.removeEventListener('pointerleave', this.onPointerEnd);
    this.host.removeEventListener('click', this.onClickCapture, true);
    this.host.removeEventListener('contextmenu', this.onContextMenu);
  }

  /** Builds the overlay outside Angular's view so no ancestor clips or stacks it. */
  private open(): void {
    this.timer = null;
    this.clearTimer();
    this.swallowNextClick = true;
    navigator.vibrate?.(10);

    const rect = this.host.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'press-menu';

    const backdrop = document.createElement('div');
    backdrop.className = 'press-menu__backdrop';

    // A visual copy of the row, placed exactly over the original, then lifted.
    const lifted = this.host.cloneNode(true) as HTMLElement;
    lifted.classList.add('press-menu__row');
    lifted.removeAttribute('id');
    lifted.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    Object.assign(lifted.style, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'press-menu__delete';
    pill.innerHTML = '<span class="material-icons" aria-hidden="true">delete</span><span>Delete</span>';
    // Under the row's right edge, unless that would tuck it behind the bottom tab bar.
    const tabBar = document.querySelector('mobile-tab-bar')?.getBoundingClientRect().height ?? 0;
    const below = rect.bottom + PILL_SPACE_PX < window.innerHeight - tabBar;
    pill.style.top = below ? `${rect.bottom + 12}px` : `${rect.top - PILL_SPACE_PX + 8}px`;
    pill.style.right = `${window.innerWidth - rect.right}px`;
    pill.classList.add(below ? 'press-menu__delete--below' : 'press-menu__delete--above');

    overlay.append(backdrop, lifted, pill);

    // Dismiss on a fresh tap only: the finger lifting off after the hold also
    // produces a click, and that one must not close the menu straight away.
    let pressed = false;
    overlay.addEventListener('pointerdown', () => (pressed = true));
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!pressed) return;
      if ((e.target as Element).closest('.press-menu__delete')) {
        this.close(true);
        this.collapseThenDelete();
      } else {
        this.close();
      }
    });
    overlay.addEventListener('contextmenu', (e) => e.preventDefault());

    document.body.appendChild(overlay);
    this.overlay = overlay;
    overlay.classList.add('press-menu--open');
    // The real row hides under its lifted copy while the menu is open.
    this.host.style.visibility = 'hidden';

    // Web Animations, so the motion runs no matter how styles were batched:
    // dim in, the row springs up from its pressed size, the pill pops out.
    const spring = 'cubic-bezier(0.2, 0.9, 0.25, 1.15)';
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out', fill: 'both' });
    lifted.animate(
      [{ transform: 'scale(0.97)' }, { transform: 'scale(1.035)' }],
      { duration: 380, easing: spring, fill: 'both' },
    );
    pill.animate(
      [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 320, delay: 60, easing: spring, fill: 'both' },
    );
  }

  /** Closes the menu; the lifted row settles back into the list (unless it's being deleted). */
  private close(deleting = false): void {
    const overlay = this.overlay;
    if (!overlay) return;
    this.overlay = null;
    overlay.style.pointerEvents = 'none';
    const options = { duration: 200, easing: 'ease-in', fill: 'forwards' as FillMode };
    overlay.querySelector('.press-menu__backdrop')?.animate([{ opacity: 1 }, { opacity: 0 }], options);
    overlay.querySelector('.press-menu__delete')?.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.8)' }], options);
    const row = overlay.querySelector('.press-menu__row');
    const settle = row?.animate(
      deleting
        ? [{ opacity: 1 }, { opacity: 0, transform: 'scale(0.96)' }]
        : [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
      options,
    );
    const done = () => {
      overlay.remove();
      if (!deleting) this.host.style.visibility = '';
    };
    if (settle) settle.finished.then(done, done);
    else setTimeout(done, 200);
  }

  /** The row folds away (height and opacity to zero), then the delete runs. */
  private collapseThenDelete(): void {
    const host = this.host;
    host.style.overflow = 'hidden';
    const collapse = host.animate(
      [{ height: `${host.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 280, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
    );
    collapse.finished.then(() => {
      this.zone.run(() => this.deleteRequested.emit());
      // If the delete fails the row is still here: bring it back.
      setTimeout(() => {
        if (!host.isConnected) return;
        collapse.cancel();
        host.style.overflow = '';
        host.style.visibility = '';
      }, 2500);
    });
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.timer = null;
    this.pressTimer = null;
    this.host.classList.remove('ledger-item--pressing');
  }
}
