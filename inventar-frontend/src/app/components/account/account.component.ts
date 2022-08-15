import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimplifiedAccount } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SideBarService } from 'src/app/services/side-bar.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  constructor(
    public accountService: AccountService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public router: Router
  ) { }

  accounts: SimplifiedAccount[];

  ngOnInit(): void {
    this.navBarService.displayNavBar = false;
    this.sideBarService.displaySidebar = false;
    this.accountService.findAllAccountsSimplified().subscribe((simplifiedAccounts: SimplifiedAccount[]) => {
      this.accounts = simplifiedAccounts;
    });
  }

  selectAccount(account: SimplifiedAccount): void {    
    this.accountService.findOne(account.id).subscribe(() => {
      localStorage.setItem("account", account.id);
      this.router.navigate(["/dashboard"]);
    });
  }

  editAccount(account: SimplifiedAccount): void {

  }

  deleteAccount(account: SimplifiedAccount): void {
    
  }

}
