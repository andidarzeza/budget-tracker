import { Component, OnInit } from '@angular/core';
import { Account } from 'src/app/models/Account';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-budget-info',
  templateUrl: './budget-info.component.html',
  styleUrls: ['./budget-info.component.css']
})
export class BudgetInfoComponent implements OnInit {

  constructor(public accountService: AccountService) { }
  public account: Account;
  ngOnInit(): void {
    this.accountService.getAccount("61b614acf563e554ee4ebb9c").subscribe((response: any) => {
      this.account = response.body;
      console.log(response.body);
    })
  }

}
