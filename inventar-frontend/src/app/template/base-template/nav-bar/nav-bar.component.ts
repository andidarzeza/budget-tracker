import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { environment } from 'src/environments/environment';

@Component({ standalone: false,
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent extends Unsubscribe implements OnInit {

  /** Same breakpoint as mobile table cards (≤767px). */
  isMobileLayout = false;

  configuration: IConfiguration;
  public EXPERIMENTAL_MODE = environment.experimentalMode;

  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sidebarService: SideBarService,
    private configurationService: ConfigurationService,
    public themeService: ThemeService,
    public accountService: AccountService,
    public router: Router,
    public breakpointService: BreakpointService
  ) {
    super();
  }

  ngOnInit(): void {
    this.clearLegacyAccentOverride();
    this.breakpointService.useTableCardLayout$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((mobile) => (this.isMobileLayout = mobile));
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.applyBodyTheme(this.themeService.themeValue);
      });
  }

  /**
   * The legacy theme picker wrote `--light` / `--lightShadowed` overrides
   * onto :root and persisted them in `themeColor` localStorage. The new
   * indigo design system owns those tokens through .light-theme/.dark-theme,
   * so any leftover override would shadow the accent. Drop both once.
   */
  private clearLegacyAccentOverride(): void {
    if (localStorage.getItem('themeColor')) {
      localStorage.removeItem('themeColor');
    }
    const root = document.documentElement;
    root.style.removeProperty('--light');
    root.style.removeProperty('--lightShadowed');
  }

  logout(): void {
    this.authenticationService.logout();
  }

  switchAccount(): void {
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  toggleDarkMode(): void {
    this.themeService.changeTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
  }

  get firstName() {
    return this.authenticationService?.currentUserValue?.firstName;
  }

  get lastName() {
    return this.authenticationService?.currentUserValue?.lastName;
  }
}
