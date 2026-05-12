import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const MAX_DECIMALS = 2;
/** Cap on the integer part so very long numbers don't overflow the
 *  fixed-width amount display next to the currency picker. 9 digits
 *  covers values up to 999,999,999, which is more than enough for the
 *  expense/income amounts this keypad is used for. */
const MAX_INTEGER_DIGITS = 9;
/** Delay before backspace starts auto-repeating on press-and-hold. */
const BACKSPACE_HOLD_DELAY_MS = 400;
/** Interval between auto-repeated backspace deletions. */
const BACKSPACE_REPEAT_INTERVAL_MS = 80;

@Component({
  selector: 'app-amount-keypad',
  templateUrl: './amount-keypad.component.html',
  styleUrls: ['./amount-keypad.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class AmountKeypadComponent implements OnDestroy {
  /** Raw keypad string (digits + optional single `.`). */
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  private backspaceHoldTimer: ReturnType<typeof setTimeout> | null = null;
  private backspaceRepeatTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopBackspaceRepeat();
  }

  onDigit(d: string): void {
    let v = this.value;
    if (v === '0' && d !== '.') {
      this.emit(d);
      return;
    }
    const parts = v.split('.');
    if (parts[1] != null && parts[1].length >= MAX_DECIMALS) {
      return;
    }
    if (parts[1] == null && parts[0].length >= MAX_INTEGER_DIGITS) {
      return;
    }
    this.emit(v + d);
  }

  onDecimal(): void {
    if (this.value.includes('.')) {
      return;
    }
    const v = this.value === '' ? '0' : this.value;
    this.emit(v + '.');
  }

  onBackspace(): void {
    this.emit(this.value.slice(0, -1));
  }

  /** Press-and-hold on the backspace button: delete one digit immediately,
   *  then auto-repeat after a short hold delay until the user lifts. */
  onBackspacePressStart(): void {
    this.onBackspace();
    this.stopBackspaceRepeat();
    this.backspaceHoldTimer = setTimeout(() => {
      this.backspaceRepeatTimer = setInterval(() => {
        if (this.value === '') {
          this.stopBackspaceRepeat();
          return;
        }
        this.onBackspace();
      }, BACKSPACE_REPEAT_INTERVAL_MS);
    }, BACKSPACE_HOLD_DELAY_MS);
  }

  stopBackspaceRepeat(): void {
    if (this.backspaceHoldTimer != null) {
      clearTimeout(this.backspaceHoldTimer);
      this.backspaceHoldTimer = null;
    }
    if (this.backspaceRepeatTimer != null) {
      clearInterval(this.backspaceRepeatTimer);
      this.backspaceRepeatTimer = null;
    }
  }

  onClear(): void {
    this.emit('');
  }

  private emit(next: string): void {
    this.valueChange.emit(next);
  }
}
