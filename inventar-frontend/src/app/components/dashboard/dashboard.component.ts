import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
    this.accountService.getAccount("61b614acf563e554ee4ebb9c").subscribe((response: any) => {
      console.log(response);
    })
  }

  addAccount(): void {
    // this.accountService.addAccount({
    //   id: '',
    //   balance: 20.2
    // }).subscribe((response: any) => {
    //   console.log(response);
      
    // })
  }

}
