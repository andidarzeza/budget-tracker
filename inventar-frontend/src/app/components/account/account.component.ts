import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SimplifiedAccount } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('400ms ease-out',
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('400ms ease-in',
              style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class AccountComponent implements OnInit, OnDestroy {

  constructor(
    public accountService: AccountService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    public sharedService: SharedService,
    public router: Router
  ) { }

  private _subject = new Subject();
  accounts: SimplifiedAccount[];
  showSpinner = true;
  ngOnInit(): void {
    this.navBarService.displayNavBar = false;
    this.sideBarService.displaySidebar = false;
    const accounts = history?.state?.accounts;
    if (!accounts) {
      this.accountService
        .findAllAccountsSimplified()
        .pipe(takeUntil(this._subject))
        .subscribe((simplifiedAccounts: SimplifiedAccount[]) => {
          this.accounts = simplifiedAccounts
          this.showSpinner = false;
        },
        ()=>{
          this.showSpinner = false;
        });
    } else {
      this.accounts = accounts;
      this.showSpinner = false;
    }


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

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

}
