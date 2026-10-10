import { Directive, ElementRef, inject, NgZone, OnDestroy, OnInit } from '@angular/core';

/** How long a finger must rest before the row lights up (iOS ≈ 100 ms). */
const PRESS_DELAY_MS = 90;
/** A tap shorter than the delay still flashes the highlight this long. */
const TAP_FLASH_MS = 120;
const MOVE_TOLERANCE_PX = 8;

/**
 * iOS-style touch highlight for list rows. CSS `:active` lights a row the
 * instant a finger lands, so scrolling a list flashes whatever row the
 * scroll started on. This adds `is-pressed` only once the finger has rested
 * briefly without moving, and drops it as soon as the touch turns into a
 * scroll. Mouse and pen keep using plain `:active` / `:hover`.
 *
 * Pair with CSS that styles `.is-pressed` and limits `:active` to
 * `(hover: hover)` devices.
 */
@Directive({
  selector: '[pressHighlight]',
})
export class PressHighlightDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private delay: ReturnType<typeof setTimeout> | null = null;
  private flash: ReturnType<typeof setTimeout> | null = null;
  private start = { x: 0, y: 0 };
  private tracking = false;

  private readonly onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    this.reset();
    this.tracking = true;
    this.start = { x: e.clientX, y: e.clientY };
    this.delay = setTimeout(() => this.host.classList.add('is-pressed'), PRESS_DELAY_MS);
  };

  private readonly onMove = (e: PointerEvent) => {
    if (!this.tracking) return;
    if (Math.hypot(e.clientX - this.start.x, e.clientY - this.start.y) > MOVE_TOLERANCE_PX) {
      this.reset();
    }
  };

  private readonly onUp = () => {
    if (!this.tracking) return;
    const waiting = this.delay != null && !this.host.classList.contains('is-pressed');
    this.reset();
    // A quick, still tap: flash the highlight so it still feels pressed.
    if (waiting) {
      this.host.classList.add('is-pressed');
      this.flash = setTimeout(() => this.host.classList.remove('is-pressed'), TAP_FLASH_MS);
    }
  };

  /** The browser took the touch for scrolling, or the finger slid off.
   *  (A touch also "leaves" right after a normal tap — `tracking` is already
   *  false then, so the tap flash survives.) */
  private readonly onCancel = () => {
    if (this.tracking) this.reset();
  };

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('pointerdown', this.onDown, { passive: true });
      this.host.addEventListener('pointermove', this.onMove, { passive: true });
      this.host.addEventListener('pointerup', this.onUp, { passive: true });
      this.host.addEventListener('pointercancel', this.onCancel, { passive: true });
      this.host.addEventListener('pointerleave', this.onCancel, { passive: true });
    });
  }

  ngOnDestroy(): void {
    this.reset();
    this.host.removeEventListener('pointerdown', this.onDown);
    this.host.removeEventListener('pointermove', this.onMove);
    this.host.removeEventListener('pointerup', this.onUp);
    this.host.removeEventListener('pointercancel', this.onCancel);
    this.host.removeEventListener('pointerleave', this.onCancel);
  }

  private reset(): void {
    this.tracking = false;
    if (this.delay) clearTimeout(this.delay);
    if (this.flash) clearTimeout(this.flash);
    this.delay = this.flash = null;
    this.host.classList.remove('is-pressed');
  }
}
