import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Income } from 'src/app/models/Income';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-income-details',
  templateUrl: './income-details.component.html',
  styleUrls: ['./income-details.component.css']
})
export class IncomeDetailsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() incomeViewId: string;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();
  incomeSubscription: Subscription;
  income: Income;
  
  constructor(
    private incomeService: IncomingsService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.getIncome();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes?.incomeViewId.firstChange) {      
      this.getIncome();
    }
  }

  getIncome(): void {
    this.incomeSubscription?.unsubscribe();
    this.incomeSubscription = this.incomeService.findOne(this.incomeViewId).subscribe((response: any) => {
      this.income = response.body;
    });
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    this.incomeViewId = "";
    this.income = null;
    this.incomeSubscription?.unsubscribe();
  }
}
