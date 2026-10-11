import { Directive, ElementRef, EventEmitter, inject, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { FeedbackService } from 'src/app/services/feedback.service';
import { collapseThenRemove } from 'src/app/utils/collapse-row';

/** Finger travel before a touch counts as a sideways swipe (vs a tap / scroll). */
const START_PX = 10;
/** Width of the Delete button when the row rests open. */
const ACTION_PX = 88;
/** Past this share of the row width, letting go deletes straight away. */
const FULL_SWIPE = 0.55;

/** The row currently swiped open; opening another one closes it (one at a time, as in Mail). */
let openRow: SwipeDeleteDirective | null = null;

/**
 * iOS swipe-to-delete for mobile list rows (Mail / Reminders): drag the row
 * left to reveal a red Delete button; let go part-way and it rests open, tap
 * Delete to remove it; swipe far enough and it deletes on release. Tapping
 * the row or scrolling closes it. Works next to `longPressDelete` on the
 * same row; vertical drags are left to the page scroll.
 *
 *   <div class="ledger-item" swipeDelete (swipeDelete)="delete(item.id)">
 *     <button class="ledger-item__main">…</button>
 *   </div>
 */
@Directive({
  selector: '[swipeDelete]',
  host: { class: 'swipe-row' },
})
export class SwipeDeleteDirective implements OnInit, OnDestroy {
  @Output() readonly swipeDelete = new EventEmitter<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly feedback = inject(FeedbackService);

  private action: HTMLButtonElement | null = null;
  private start = { x: 0, y: 0, offset: 0 };
  private tracking = false;
  private swiping = false;
  private offset = 0; // current left shift of the row content (≤ 0)
  private pastFull = false;
  private swallowClick = false;

  private get content(): HTMLElement | null {
    return this.host.querySelector<HTMLElement>('.ledger-item__main');
  }

  private readonly onDown = (e: PointerEvent) => {
    if (this.host.classList.contains('row-removing')) return;
    if (e.pointerType === 'mouse' || (e.target as Element).closest('.swipe-delete-action')) return;
    if (openRow && openRow !== this) openRow.close();
    this.tracking = true;
    this.swiping = false;
    this.start = { x: e.clientX, y: e.clientY, offset: this.offset };
  };

  private readonly onMove = (e: PointerEvent) => {
    if (!this.tracking) return;
    const dx = e.clientX - this.start.x;
    const dy = e.clientY - this.start.y;
    if (!this.swiping) {
      if (Math.abs(dx) < START_PX && Math.abs(dy) < START_PX) return;
      // Mostly vertical: it's a scroll — let the page have it.
      if (Math.abs(dy) > Math.abs(dx) || (dx > 0 && this.start.offset === 0)) {
        this.tracking = false;
        return;
      }
      this.swiping = true;
      try {
        // Keep receiving moves even if the finger leaves the row.
        this.host.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      this.ensureAction();
      this.host.classList.add('swipe-row--active');
    }
    const width = this.host.offsetWidth;
    let next = Math.min(0, this.start.offset + dx);
    // Rubber-band past the full width.
    if (next < -width) next = -width + (next + width) * 0.25;
    this.setOffset(next, false);
    const past = -next > width * FULL_SWIPE;
    if (past !== this.pastFull) {
      this.pastFull = past;
      this.host.classList.toggle('swipe-row--full', past);
      this.feedback.haptic('light');
    }
  };

  private readonly onUp = () => {
    if (!this.tracking) return;
    this.tracking = false;
    if (!this.swiping) {
      // A tap on an open row closes it (and must not open the edit page).
      if (this.offset !== 0) {
        this.swallowClick = true;
        this.close();
      }
      return;
    }
    this.swiping = false;
    this.swallowClick = true; // the release may click the row underneath
    setTimeout(() => (this.swallowClick = false), 350);
    if (this.pastFull) {
      this.removeRow();
    } else if (-this.offset > ACTION_PX / 2) {
      this.setOffset(-ACTION_PX, true);
      openRow = this;
    } else {
      this.close();
    }
  };

  private readonly onCancel = () => {
    if (!this.tracking) return;
    this.tracking = false;
    if (this.swiping) {
      this.swiping = false;
      this.close();
    }
  };

  private readonly onClickCapture = (e: MouseEvent) => {
    if (!this.swallowClick) return;
    this.swallowClick = false;
    e.stopPropagation();
    e.preventDefault();
  };

  private readonly onScroll = () => {
    if (this.offset !== 0 && !this.swiping) this.close();
  };

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('pointerdown', this.onDown, { passive: true });
      this.host.addEventListener('pointermove', this.onMove, { passive: true });
      this.host.addEventListener('pointerup', this.onUp, { passive: true });
      this.host.addEventListener('pointercancel', this.onCancel, { passive: true });
      this.host.addEventListener('click', this.onClickCapture, true);
      window.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
    });
    // A failed delete brings the row back: reset it.
    this.host.addEventListener('row-restored', () => {
      this.host.classList.remove('swipe-row--full');
      this.pastFull = false;
      this.setOffset(0, false);
    });
  }

  ngOnDestroy(): void {
    if (openRow === this) openRow = null;
    this.host.removeEventListener('pointerdown', this.onDown);
    this.host.removeEventListener('pointermove', this.onMove);
    this.host.removeEventListener('pointerup', this.onUp);
    this.host.removeEventListener('pointercancel', this.onCancel);
    this.host.removeEventListener('click', this.onClickCapture, true);
    window.removeEventListener('scroll', this.onScroll, { capture: true });
  }

  close(): void {
    if (openRow === this) openRow = null;
    this.pastFull = false;
    this.host.classList.remove('swipe-row--full');
    this.setOffset(0, true);
  }

  /** Red button behind the row's right edge; it widens as the row slides. */
  private ensureAction(): void {
    if (this.action) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swipe-delete-action';
    button.setAttribute('aria-label', 'Delete');
    button.innerHTML = '<span class="material-icons" aria-hidden="true">delete</span><span>Delete</span>';
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeRow();
    });
    this.host.appendChild(button);
    this.action = button;
  }

  private setOffset(value: number, animate: boolean): void {
    this.offset = value;
    const content = this.content;
    const ease = 'transform 0.35s cubic-bezier(0.2, 0.9, 0.25, 1), width 0.35s cubic-bezier(0.2, 0.9, 0.25, 1)';
    if (content) {
      content.style.transition = animate ? ease : 'none';
      content.style.transform = value ? `translateX(${value}px)` : '';
    }
    if (this.action) {
      this.action.style.transition = animate ? ease : 'none';
      this.action.style.width = `${-value}px`;
    }
    if (value === 0 && animate) {
      setTimeout(() => {
        if (this.offset === 0) this.host.classList.remove('swipe-row--active');
      }, 350);
    }
  }

  /** Slide fully out, fold the row away, then delete. */
  private removeRow(): void {
    if (this.host.classList.contains('row-removing')) return;
    if (openRow === this) openRow = null;
    this.feedback.haptic('medium');
    this.setOffset(-this.host.offsetWidth, true);
    setTimeout(() => collapseThenRemove(this.host, () => this.zone.run(() => this.swipeDelete.emit())), 200);
  }
}
