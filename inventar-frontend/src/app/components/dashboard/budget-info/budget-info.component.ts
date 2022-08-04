import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Account } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'budget-info',
  templateUrl: './budget-info.component.html',
  styleUrls: ['./budget-info.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('500ms ease-out', style({opacity: 1 }))
          ]
        )
      ]
    ),
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
export class BudgetInfoComponent implements OnInit, OnDestroy {

  constructor(
    public accountService: AccountService, 
    public sharedService: SharedService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }

  public account: Account;
  private _subject = new Subject();
  public hideBalance: boolean = false;
  public hiddenBalance: string = '';
  public showDatePicker: boolean = false;
  public dateFrom: Date = new Date();
  public dateTo: Date = new Date(this.dateFrom.getFullYear(), this.dateFrom.getMonth() + 1);
  
  @Output() dateSelected: EventEmitter<any> = new EventEmitter();
  
  ngOnInit(): void {
    this.hideBalance = (localStorage.getItem("hideBalance") === 'true');
    this.emitSelectedDate();
    this.accountService
      .getAccount()
      .pipe(takeUntil(this._subject))
      .subscribe((response: any) => {
        this.account = response.body;
        if(this.hideBalance) {
          this.generateHiddenBalanceValue();
        }
      });
  }

  switchDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  emitSelectedDate(): void {
    this.dateSelected.emit({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    })
  }

  public toggleHideBalance(): void {
    if(!this.hideBalance) {
      this.generateHiddenBalanceValue();
    } else {
      this.hiddenBalance = "";
    }
    this.hideBalance = !this.hideBalance;
    localStorage.setItem("hideBalance", this.hideBalance.toString());
  }

  private generateHiddenBalanceValue(): void {
    for(let i = 0;i<this.account?.balance?.toString().length + 3;i++) {
      this.hiddenBalance += "*";
    }
  }

  public onDateSelected(date: Date): void {
    this.dateFrom = date;
    this.dateTo = new Date(this.dateFrom.getFullYear(), this.dateFrom.getMonth() + 1)
    this.emitSelectedDate();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
    document.removeEventListener('click', this.offClickHandler.bind(this), true); // bind on doc
  }

  public offClickHandler(event:any) {    
    const selectedDateElem = document.getElementById("selectedDateId");
    if(selectedDateElem) {
      if(!selectedDateElem?.contains(event.target)) {
        this.showDatePicker = false;
      }
    }
  }
}
