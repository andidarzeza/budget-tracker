import { Component, Input, OnInit } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';

@Component({
  selector: 'form-spinner',
  templateUrl: './form-spinner.component.html',
  styleUrls: ['./form-spinner.component.css'],
  animations: [inOutAnimation]
})
export class FormSpinnerComponent implements OnInit {

  @Input() loadingData: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
