import { Directive, ElementRef, inject, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * Smoothly resizes the host to fit its content (like an iOS card changing
 * size). The host needs a single wrapper child; whenever that child's height
 * changes — different content swapped in, rows loading — the host animates
 * from its old height to the new one.
 *
 *   <div animateHeight><div> …content… </div></div>
 */
@Directive({
  selector: '[animateHeight]',
  host: { class: 'animate-height' },
})
export class AnimateHeightDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private observer: ResizeObserver | null = null;
  private current = -1;

  ngOnInit(): void {
    const inner = this.host.firstElementChild as HTMLElement | null;
    if (!inner || typeof ResizeObserver === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      this.observer = new ResizeObserver(() => this.resize(inner));
      this.observer.observe(inner);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private resize(inner: HTMLElement): void {
    const next = inner.offsetHeight;
    if (next === this.current) return;
    const first = this.current < 0;
    this.current = next;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (first || reduceMotion || !this.host.animate) {
      this.host.style.height = `${next}px`;
      return;
    }
    const from = this.host.getBoundingClientRect().height;
    this.host.style.height = `${next}px`;
    this.host.getAnimations().forEach((a) => a.cancel());
    this.host.animate([{ height: `${from}px` }, { height: `${next}px` }], {
      duration: 340,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    });
  }
}
