import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
  actualYear: number = this.today.getFullYear();
  avalaibleYears: number[] = [];
  selectedRange: number[] = [];
  selectedMonth = this.today.getMonth();
  selectedDay = this.today.getDate();
  increased = 0;
  months: string[] = MONTHS_ABR;
  @ViewChild('daily') daily: ElementRef;
  @ViewChild('monthly') monthly: ElementRef;
  @ViewChild('yearly') yearly: ElementRef;
  @ViewChild('monthlyCnt') monthlyCnt: ElementRef;
  @ViewChild('yearlyCnt') yearlyCnt: ElementRef;
  @ViewChild('dailyCnt') dailyCnt: ElementRef;

  constructor() { 
    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }

  ngOnInit(): void {
    this.populateYearsArray();
    this.populateRangeArray();
  }

  private populateRangeArray(): void {
    const rangeStart = this.selectedYear - 11;
    let counter = 0;
    for(let i = rangeStart;i<=this.selectedYear;i++) {
      this.selectedRange.push(rangeStart+counter);
      counter++;
    }
  }

  private populateYearsArray(): void {
    for(let i = 1975;i<=this.actualYear;i++) {
      this.avalaibleYears.push(i);
    }
    this.increased = this.avalaibleYears.length - 1;
    this.changeYear();
  }

  public increaseYear(): void {
    if(this.selectedYear < this.actualYear) {
      this.selectedYear++;
    }
  }

  public decreaseYear(): void {
    if(this.selectedYear > 1975) {
      this.selectedYear--;
    }
  }

  public increaseRange(): void {
    if(this.selectedRange[this.selectedRange.length-1] !== this.actualYear) {
      this.selectedRange = this.selectedRange.map((year: number) => {
        return year + 11;
      });
    }
  }

  public decreaseRange(): void {
    if(this.selectedRange[0] > 1975) {
      this.selectedRange = this.selectedRange.map((year: number) => {
        if(year-11 >= 1975)
          return year - 11;
        else 
          return null;
      }).filter(item => item!=null);
    }
  }

  public changeYear(): void {
    const yearCnt = document.getElementById("year-container");
    if(yearCnt) {
      yearCnt.style.transform = `translateX(${-50 * this.increased}px)`;
      this.selectedYear = this.avalaibleYears[this.increased];
    }
  }

  public selectDay(day: number): void {
    this.selectedDay = day;
  }

  public selectMonth(month: string): void {
    this.selectedMonth = this.months.indexOf(month);
    this.changeViewType("Daily");
  }

  public selectYear(year: number): void {
    this.selectedYear = year;
    this.changeViewType("Monthly");
  }

  public close(): void {
    this.dateSelected.emit(new Date(this.selectedYear, this.selectedMonth, this.selectedDay));
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

  public changeViewType(arg: string): void {
    switch(arg) { 
      case "Daily": { 
        this.monthlyCnt.nativeElement.style.transform = "translateX(0%)";
        this.dailyCnt.nativeElement.style.transform = "translateX(0%)";
        this.yearlyCnt.nativeElement.style.transform = "translateX(0%)";
         break; 
      } 
      case "Monthly": {
        this.dailyCnt.nativeElement.style.transform = "translateX(-100%)";
        this.monthlyCnt.nativeElement.style.transform = "translateX(-100%)";
        this.yearlyCnt.nativeElement.style.transform = "translateX(-100%)";
        break; 
      } 
      case "Yearly": {
        this.dailyCnt.nativeElement.style.transform = "translateX(-200%)";
        this.monthlyCnt.nativeElement.style.transform = "translateX(-200%)";
        this.yearlyCnt.nativeElement.style.transform = "translateX(-200%)";
         break; 
      } 
   }
  }

}
