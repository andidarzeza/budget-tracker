import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DateUtil, Day } from 'src/app/utils/DateUtil';
import { MONTHS_ABR } from 'src/environments/environment';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit, OnDestroy {
  @Output() dateSelected: EventEmitter<any> = new EventEmitter();

  today = new Date();
  @Input() selectedYear: number = this.today.getFullYear();
  actualYear: number = this.today.getFullYear();
  selectedRange: number[] = [];
  @Input() selectedMonth = this.today.getMonth();
  @Input() selectedDay = this.today.getDate();
  months: string[] = MONTHS_ABR;
  days: number[] = [];

  @ViewChild('daily') daily: ElementRef;
  @ViewChild('monthly') monthly: ElementRef;
  @ViewChild('yearly') yearly: ElementRef;
  @ViewChild('monthlyCnt') monthlyCnt: ElementRef;
  @ViewChild('yearlyCnt') yearlyCnt: ElementRef;
  @ViewChild('dailyCnt') dailyCnt: ElementRef;

  constructor() { 
    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.offClickHandler.bind(this), true); // bind on doc
  }

  ngOnInit(): void {
    this.populateYearsArray();
    this.populateRangeArray();
    this.populateDaysArray(this.selectedYear, this.selectedMonth);
  }

  private populateRangeArray(): void {
    for(let i = this.selectedYear - 11;i<=this.selectedYear;i++) {
      this.selectedRange.push(i);
    }
  }

  private populateYearsArray(): void {

  }

  private populateDaysArray(year: number, month: number): void {
    this.days = [];
    const currentYearObject = new DateUtil().fromYear(year).getMonthByValue(month).getDaysOfMonth();
    const copyNullValuesTimes = currentYearObject[0].getDayOfWeek();
    for(let i = 0;i<copyNullValuesTimes-1;i++) {
      this.days.push(null);
    }
    this.days = this.days.concat(currentYearObject.map((dateObject: Day) => dateObject.getDayNumber()));
  }

  increaseMonth(): void {
    const date = new Date(this.selectedYear, this.selectedMonth);
    date.setMonth(date.getMonth() + 1);
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth();
    this.populateDaysArray(this.selectedYear, this.selectedMonth);
  }

  decreaseMonth(): void {
    const date = new Date(this.selectedYear, this.selectedMonth);
    date.setMonth(date.getMonth() - 1);
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth();
    this.populateDaysArray(this.selectedYear, this.selectedMonth);
  }

  public increaseYear(): void {
    if(this.selectedYear < this.actualYear) {
      this.selectedYear++;
    }
  }

  public decreaseYear(): void {
      this.selectedYear--;
  }

  public increaseRange(): void {
    if(this.selectedRange[this.selectedRange.length-1] !== this.actualYear)
      this.selectedRange = this.selectedRange.map((year: number) => year + 12);
  }

  public decreaseRange(): void {
    if(this.selectedRange[0] >=1250 + 12) {
      this.selectedRange = this.selectedRange.map((year: number) => year - 12);
    }
  }

  public selectDay(day: number): void {
    if(day)
      this.selectedDay = day;
  }

  public selectMonth(month: string): void {
    this.selectedMonth = this.months.indexOf(month);
    this.populateDaysArray(this.selectedYear, this.selectedMonth);
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
    if(elem && selectedDateElem) {
      if(!elem[0]?.contains(event.target) && !selectedDateElem?.contains(event.target)) {
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
