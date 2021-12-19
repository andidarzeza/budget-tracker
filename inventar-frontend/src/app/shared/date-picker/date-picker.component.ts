import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MONTHS_ABR } from 'src/environments/environment';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {
  @Output() dateSelected: EventEmitter<any> = new EventEmitter();

  today = new Date();
  selectedYear: number = this.today.getFullYear();
  avalaibleYears: number[] = [];
  selectedMonth = this.today.getMonth();
  increased = 0;
  months: string[] = MONTHS_ABR;
  constructor() { 

    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }

  ngOnInit(): void {
    this.populateYearsArray();
  }

  private populateYearsArray(): void {
    for(let i = 1975;i<=2021;i++) {
      this.avalaibleYears.push(i);
    }
    this.increased = this.avalaibleYears.length - 1;
    this.changeYear();
  }

  public increaseYear(): void {
    if(this.increased !== this.avalaibleYears.length - 1) {
      this.increased++;
      this.changeYear();
    }
  }

  public decreaseYear(): void {
    if(this.increased !== 0) {
      this.increased--;
      this.changeYear();
    }
  }

  public changeYear(): void {
    const yearCnt = document.getElementById("year-container");
    if(yearCnt) {
      yearCnt.style.transform = `translateX(${-50 * this.increased}px)`;
      this.selectedYear = this.avalaibleYears[this.increased];
    }
  }

  public selectMonth(month: string): void {
    this.selectedMonth = this.months.indexOf(month);
  }

  public close(): void {
    this.dateSelected.emit(new Date(this.selectedYear, this.selectedMonth));
  }

  public offClickHandler(event:any) {
    const elem = document.getElementsByTagName("app-date-picker") as any;
    const selectedDateElem = document.getElementById("selectedDateId");
    console.log(elem);
    
    if(elem && selectedDateElem) {
      if(!elem[0].contains(event.target) && !selectedDateElem.contains(event.target)) {
        this.close();
      }
    }
  }

}
