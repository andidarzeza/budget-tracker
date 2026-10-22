import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, signal } from '@angular/core';

/** Loading/saving faster than this never shows (or blocks with) the overlay. */
const SHOW_DELAY_MS = 2000;

@Component({
  selector: 'form-spinner',
  templateUrl: './form-spinner.component.html',
  styleUrls: ['./form-spinner.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSpinnerComponent {
  /** Shown under the spinner (e.g. "Saving…", "Loading…"). */
  @Input() message: string;

  /**
   * The overlay is only rendered once loading has lasted SHOW_DELAY_MS.
   * (A CSS animation-delay kept an invisible overlay eating clicks, and
   * made its leave wait out the delay — flashing the spinner at the end.)
   */
  readonly visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  @Input() set loadingData(loading: boolean) {
    if (loading) {
      this.timer ??= setTimeout(() => {
        this.timer = null;
        this.visible.set(true);
      }, SHOW_DELAY_MS);
    } else {
      this.clearTimer();
      this.visible.set(false);
    }
  }

  get displayMessage(): string {
    return this.message != null && this.message !== '' ? this.message : 'Please wait…';
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
