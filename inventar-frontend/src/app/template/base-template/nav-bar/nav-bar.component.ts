import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IConfiguration } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
  readonly sharedService = inject(SharedService);
  readonly authenticationService = inject(AuthenticationService);
  readonly sidebarService = inject(SideBarService);
  readonly themeService = inject(ThemeService);
  readonly accountService = inject(AccountService);
  readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Same breakpoint as mobile table cards (≤767px). */
  readonly isMobileLayout = signal(false);

  configuration: IConfiguration;
  readonly EXPERIMENTAL_MODE = environment.experimentalMode;

  ngOnInit(): void {
    this.clearLegacyAccentOverride();
    this.breakpointService.useTableCardLayout$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mobile) => this.isMobileLayout.set(mobile));
    this.configurationService
      .getConfiguration()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
