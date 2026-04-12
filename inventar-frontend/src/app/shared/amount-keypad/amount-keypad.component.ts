import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

const MAX_DECIMALS = 2;

@Component({
  standalone: false,
  selector: 'app-amount-keypad',
  templateUrl: './amount-keypad.component.html',
  styleUrls: ['./amount-keypad.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
