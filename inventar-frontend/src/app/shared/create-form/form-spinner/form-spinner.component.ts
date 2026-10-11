import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'form-spinner',
  templateUrl: './form-spinner.component.html',
  styleUrls: ['./form-spinner.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSpinnerComponent {
  @Input() loadingData: boolean;
  /** Shown under the spinner (e.g. "Saving…", "Loading…"). */
  @Input() message: string;

  get displayMessage(): string {
    return this.message != null && this.message !== '' ? this.message : 'Please wait…';
  }
}
