import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { RangeType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'budget-info',
  templateUrl: './budget-info.component.html',
  styleUrls: ['./budget-info.component.css'],
  animations: [
    trigger(
      'datePickerAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('150ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('150ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class BudgetInfoComponent extends Unsubscribe implements OnInit, OnDestroy {

  constructor(
    public accountService: AccountService, 
    public sharedService: SharedService
  ) {
    super();
    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }


  ranges: RangeType[] = []
  selectedRange: RangeType = "1W";
  public showDatePicker: boolean = false;
  public dateFrom: Date = new Date();
  public dateTo: Date = new Date(this.dateFrom.getFullYear(), this.dateFrom.getMonth() + 1);
  
  @Output() dateSelected: EventEmitter<any> = new EventEmitter();
  @Output() onRangeSelect: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.emitSelectedDate();
  }

  switchDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  emitSelectedDate(): void {
    this.dateSelected.emit({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    });
  }
  
  selectRange(range: RangeType): void {
    this.selectedRange = range;
    this.onRangeSelect.emit(this.selectedRange);
  }

  public onDateSelected(date: Date): void {
    this.dateFrom = date;
    this.dateTo = new Date(this.dateFrom.getFullYear(), this.dateFrom.getMonth() + 1)
    this.emitSelectedDate();
  }

  public offClickHandler(event:any) {    
    const selectedDateElem = document.getElementById("selectedDateId");
    if(selectedDateElem) {
      if(!selectedDateElem?.contains(event.target)) {
        this.showDatePicker = false;
      }
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.offClickHandler.bind(this), true); // bind on doc
  }
}
