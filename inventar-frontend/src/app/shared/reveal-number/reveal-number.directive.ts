import { Directive, ElementRef, inject, Input, OnChanges } from '@angular/core';

const HIDDEN_TEXT = '••••••';

/**
 * Shows a formatted amount (like `number:'1.2-2'`, en-US), or •••••• in
 * privacy mode.
 *
 *   <span [revealNumber]="total"></span>
 *   <span [revealNumber]="net" revealSigned [revealHidden]="balanceHidden()"></span>
 *
 * No entrance animation: the data is prefetched, so numbers are simply there
 * when a page opens (the fade-in read as a flicker).
 */
@Directive({
  selector: '[revealNumber]',
  host: { class: 'reveal-number' },
})
export class RevealNumberDirective implements OnChanges {
  @Input({ required: true }) revealNumber: number | null | undefined;
  /** Prefix positive values with "+". */
  @Input({ transform: (v: unknown) => v !== false }) revealSigned = false;
  /** Show •••••• instead of the number (privacy mode). */
  @Input() revealHidden = false;
  /** Text before the number, e.g. "−" for expense totals. */
  @Input() revealPrefix = '';
  @Input() revealDecimals = 2;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnChanges(): void {
    const text = this.format();
    if (text !== this.el.textContent) this.el.textContent = text;
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
}
