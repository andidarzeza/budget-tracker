import { Directive, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FeedbackService, isIos } from 'src/app/services/feedback.service';

/**
 * iPhone haptic on tap. Since iOS 26.5 Safari only plays haptics for a
 * *direct* tap on a native `<input type="checkbox" switch>` (or a label wired
 * to one) — code can't trigger them any more. So the host gets a transparent
 * `<label>` laid over it, holding a hidden switch:
 *
 *  - a real tap lands on the label → Safari forwards a trusted click to the
 *    switch → it toggles → the system haptic plays;
 *  - the label's own click bubbles on to the host, so its (click) handler
 *    still runs (the switch's forwarded click is stopped, so it runs once);
 *  - scrolls never become clicks, and the label has no touch handling of its
 *    own, so lists starting a scroll on it scroll normally.
 *
 * Only added on iOS (Android uses the Vibration API), and hidden while
 * Settings → Haptics is off.
 *
 *   <button hapticTap (click)="…">…</button>
 */
@Directive({
  selector: '[hapticTap]',
})
export class HapticTapDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly feedback = inject(FeedbackService);
  private label: HTMLLabelElement | null = null;

  constructor() {
    effect(() => {
      const on = this.feedback.hapticsOn();
      if (this.label) this.label.hidden = !on;
    });
  }

  ngOnInit(): void {
    if (!isIos()) return;
    const label = document.createElement('label');
    label.className = 'haptic-tap';
    label.setAttribute('aria-hidden', 'true');
    label.hidden = !this.feedback.hapticsOn();
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    // The label's click already reaches the host; don't let the forwarded one too.
    input.addEventListener('click', (e) => e.stopPropagation());
    label.appendChild(input);
    if (getComputedStyle(this.host).position === 'static') this.host.style.position = 'relative';
    this.host.appendChild(label);
    this.label = label;
  }

  ngOnDestroy(): void {
    this.label?.remove();
  }
}
