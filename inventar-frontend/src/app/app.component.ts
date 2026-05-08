import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from './models/models';
import { AccountService } from './services/account.service';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { SharedService } from './services/shared.service';
import { ThemeService } from './services/theme.service';
import { Unsubscribe } from './shared/unsubscribe';


@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends Unsubscribe implements OnInit {
  readonly authenticationService = inject(AuthenticationService);
  readonly sharedService = inject(SharedService);
  readonly router = inject(Router);
  private readonly configurationService = inject(ConfigurationService);
  private readonly accountService = inject(AccountService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    super();
    this.themeService.initTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
  }

  ngOnInit(): void {
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((configuration: IConfiguration) => {
        localStorage.setItem('baseCurrency', configuration.baseCurrency);
        this.sharedService.applyBodyTheme(this.themeService.themeValue);
      });
    this.sharedService.listenForThemeChange();

    if (this.accountService?.getAccount() == null) {
      this.router.navigate(['/account']);
    } else {
      this.accountService
        .findOne(this.accountService.getAccount())
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe();
    }
  }

  onActivate(): void {
    const spinner = document.getElementById('application-loader');
    setTimeout(() => {
      if (spinner) {
        spinner.style.opacity = '0';
      }
    }, 0);
  }
}
