import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const MAX_DECIMALS = 2;
/** Cap on the integer part so very long numbers don't overflow the
 *  fixed-width amount display next to the currency picker. 9 digits
 *  covers values up to 999,999,999, which is more than enough for the
 *  expense/income amounts this keypad is used for. */
const MAX_INTEGER_DIGITS = 9;

@Component({
  selector: 'app-amount-keypad',
  templateUrl: './amount-keypad.component.html',
  styleUrls: ['./amount-keypad.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class AmountKeypadComponent {
  /** Raw keypad string (digits + optional single `.`). */
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

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

  onClear(): void {
    this.emit('');
  }

  private emit(next: string): void {
    this.valueChange.emit(next);
  }
}
