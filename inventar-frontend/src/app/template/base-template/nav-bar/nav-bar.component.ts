import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration, Theme } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent extends Unsubscribe implements OnInit {
  
  configuration: IConfiguration;
  public EXPERIMENTAL_MODE = environment.experimentalMode;

  public themesArray: Theme[] = [
    {
      name: 'Default',
      color: 'rgba(0, 105, 92, 1)',
      shadowedColor: 'rgba(0, 105, 92, 0.5)'
    },
    {
      name: 'Pink & Blue-grey',
      color: 'rgba(233, 30, 99, 1)',
      shadowedColor: 'rgba(233, 30, 99, 0.5)'
    },
    {
      name: 'Purple',
      color: 'rgba(103, 58, 183, 1)',
      shadowedColor: 'rgba(103, 58, 183, 0.5)'
    },
    {
      name: 'Indigo Pink',
      color: 'rgba(63, 81, 181, 1)',
      shadowedColor: 'rgba(63, 81, 181, 0.5)'
    },
    {
      name: "Amber",
      color: 'rgba(254, 178, 4, 1)',
      shadowedColor: 'rgba(254, 178, 4, 0.5)'
    },
    {
      name: "Deep Amber",
      color: 'rgba(255, 133, 3, 1)',
      shadowedColor: 'rgba(255, 133, 3, 0.5)'
    }

  ]

  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sidebarService: SideBarService,
    private configurationService: ConfigurationService,
    private themeService: ThemeService,
    public accountService: AccountService,
    public router: Router,
    public breakpointService: BreakpointService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setInitialTheme();
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.darkMode = configuration.darkMode;
        this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
      });
  }

  private setInitialTheme(): void {
    const theme: string = localStorage.getItem("themeColor");
    if(theme) this.changeThemeColor({color: theme} as Theme);
  }

  logout(): void {
    this.authenticationService.logout();
  }

  switchAccount(): void {
    localStorage.removeItem("account");
    this.router.navigate(["/account"]);
  }

  toggleDarkMode(): void {
    
    this.themeService.changeTheme();
    // this.configuration.darkMode = !this.sharedService.darkMode;
    // this.configurationService
    //   .updateConfiguration()
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(() => {
    //     this.sharedService.changeTheme();
    //   });
  }

  changeThemeColor(theme: Theme): void {
    const root: HTMLElement = document.documentElement;
    root.style.setProperty('--light', theme.color);
    root.style.setProperty('--lightShadowed', theme.shadowedColor);
    localStorage.setItem("themeColor", theme.color);
    this.themeService.next(theme.color);
  }

  get firstName() {
    return this.authenticationService?.currentUserValue?.firstName;
  }  
  
  get lastName() {
    return this.authenticationService?.currentUserValue?.lastName;
  }
}
