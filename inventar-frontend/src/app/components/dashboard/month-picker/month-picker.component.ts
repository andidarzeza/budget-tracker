import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ChartUtils } from 'src/app/utils/chart';

@Component({
  selector: 'month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.css']
})
export class MonthPickerComponent implements AfterViewInit {

  constructor(
  ) { }

  ngAfterViewInit(): void {

  }

}
