import { Component, Input, OnInit } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';

@Component({ standalone: false,
  selector: 'form-spinner',
  templateUrl: './form-spinner.component.html',
  styleUrls: ['./form-spinner.component.css'],
  animations: [inOutAnimation]
})
export class FormSpinnerComponent implements OnInit {

  @Input() loadingData: boolean;
  /** Shown under the spinner (e.g. “Saving…”, “Loading…”). */
  @Input() message: string;

  get displayMessage(): string {
    return this.message != null && this.message !== '' ? this.message : 'Please wait…';
  }

  constructor() { }

  ngOnInit(): void {
  }

}
