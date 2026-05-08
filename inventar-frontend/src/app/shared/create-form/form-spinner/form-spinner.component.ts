import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';

@Component({
  selector: 'form-spinner',
  templateUrl: './form-spinner.component.html',
  styleUrls: ['./form-spinner.component.css'],
  imports: [CommonModule],
  animations: [inOutAnimation],
})
export class FormSpinnerComponent {
  @Input() loadingData: boolean;
  /** Shown under the spinner (e.g. "Saving…", "Loading…"). */
  @Input() message: string;

  get displayMessage(): string {
    return this.message != null && this.message !== '' ? this.message : 'Please wait…';
  }
}
