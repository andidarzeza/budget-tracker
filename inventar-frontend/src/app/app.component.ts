import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from './models/models';
import { AccountService } from './services/account.service';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { SharedService } from './services/shared.service';
import { ThemeService } from './services/theme.service';
import { Unsubscribe } from './shared/unsubscribe';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent extends Unsubscribe implements OnInit {

  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    private configurationService: ConfigurationService,
    private accountService: AccountService,
    public router: Router,
    private themeService: ThemeService
  ) {
    super();
    this.themeService.initTheme();
  }

  ngOnInit(): void {
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((configuration: IConfiguration) => {
        localStorage.setItem("baseCurrency", configuration.baseCurrency);
        this.sharedService.theme = configuration.darkMode? 'dark' : 'light'
      });
    this.sharedService.listenForThemeChange();
      
    if(this.accountService?.getAccount() == null) {      
      this.router.navigate(["/account"]);
    } else {
      this.accountService
        .findOne(this.accountService.getAccount())
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe();
    }
  }

}
