import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { IConfiguration } from './models/models';
import { AccountService } from './services/account.service';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { SharedService } from './services/shared.service';
import { ThemeService } from './services/theme.service';
import { BaseTemplateComponent } from './template/base-template/base-template.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, BaseTemplateComponent],
})
export class AppComponent implements OnInit {
  readonly authenticationService = inject(AuthenticationService);
  readonly sharedService = inject(SharedService);
  readonly router = inject(Router);
  private readonly configurationService = inject(ConfigurationService);
  private readonly accountService = inject(AccountService);
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.themeService.initTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
  }

  ngOnInit(): void {
    this.configurationService
      .getConfiguration()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
        .pipe(takeUntilDestroyed(this.destroyRef))
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
