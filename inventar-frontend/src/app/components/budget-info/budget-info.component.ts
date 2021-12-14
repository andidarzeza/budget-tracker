import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Account } from 'src/app/models/Account';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-budget-info',
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
    )
  ]
})
export class BudgetInfoComponent implements OnInit {

  constructor(public accountService: AccountService) { }
  public account: Account;
  public hideBalance: boolean = false;
  public hiddenBalance: string = '';
  ngOnInit(): void {
    this.accountService.getAccount("61b614acf563e554ee4ebb9c").subscribe((response: any) => {
      this.account = response.body;
    })
  }

  public toggleHideBalance(): void {
    if(!this.hideBalance) {
      this.generateHiddenBalanceValue();
    } else {
      this.hiddenBalance = "";
    }
    this.hideBalance = !this.hideBalance;
  }

  private generateHiddenBalanceValue(): void {
    for(let i = 0;i<this.account?.balance?.toString().length + 3;i++) {
      this.hiddenBalance += "*";
    }
  }

}
