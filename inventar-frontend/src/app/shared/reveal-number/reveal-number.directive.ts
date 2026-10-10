import { Directive, ElementRef, inject, Input, OnChanges, OnDestroy } from '@angular/core';

const HIDDEN_TEXT = '••••••';

/**
 * Shows a formatted amount and, when it first appears or changes, lets it
 * come in from a soft blur while rising a few pixels (iOS widget refresh).
 *
 *   <span [revealNumber]="total"></span>
 *   <span [revealNumber]="net" revealSigned [revealHidden]="balanceHidden()"></span>
 *
 * The first reveal waits until the number is actually on screen, so values
 * on a hidden tab animate when that tab is opened. Formats like
 * `number:'1.2-2'` (en-US).
 */
@Directive({
  selector: '[revealNumber]',
  host: { class: 'reveal-number' },
})
export class RevealNumberDirective implements OnChanges, OnDestroy {
  @Input({ required: true }) revealNumber: number | null | undefined;
  /** Prefix positive values with "+". */
  @Input({ transform: (v: unknown) => v !== false }) revealSigned = false;
  /** Show •••••• instead of the number (privacy mode). */
  @Input() revealHidden = false;
  /** Text before the number, e.g. "−" for expense totals. */
  @Input() revealPrefix = '';
  @Input() revealDecimals = 2;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private seen = false;
  private observer: IntersectionObserver | null = null;

  ngOnChanges(): void {
    const text = this.format();
    if (text === this.el.textContent) return;
    this.el.textContent = text;
    if (this.seen) this.play();
    else this.waitUntilVisible();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private format(): string {
    if (this.revealHidden) return HIDDEN_TEXT;
    const value = this.revealNumber;
    if (value == null || !isFinite(value)) return '';
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: this.revealDecimals,
      maximumFractionDigits: this.revealDecimals,
    });
    return this.revealPrefix + (this.revealSigned && value > 0 ? '+' : '') + formatted;
  }

  private waitUntilVisible(): void {
    if (this.observer) return;
    if (typeof IntersectionObserver === 'undefined') {
      this.seen = true;
      return;
    }
    // Keep it invisible until it is revealed, so there is no flash first.
    this.el.style.opacity = '0';
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      this.observer?.disconnect();
      this.observer = null;
      this.seen = true;
      this.el.style.opacity = '';
      this.play();
    });
    this.observer.observe(this.el);
  }

  private play(): void {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.el.getAnimations?.().forEach((a) => a.cancel());
    this.el.animate?.(
      [
        { opacity: 0, filter: 'blur(6px)', transform: 'translateY(6px)' },
        { opacity: 1, filter: 'blur(0)', transform: 'none' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }
}
