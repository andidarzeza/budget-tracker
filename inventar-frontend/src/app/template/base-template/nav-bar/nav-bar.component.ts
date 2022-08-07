import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration, Theme } from 'src/app/models/models';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { LocationService } from 'src/app/services/location.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  interval = null;
  currentDate = new Date();
  configuration: IConfiguration;
  private _subject = new Subject();
  public EXPERIMENTAL_MODE = environment.experimentalMode;

  public themesArray: Theme[] = [
    {
      name: 'Default',
      color: 'rgba(0, 105, 92, 1)'
    },
    {
      name: 'Pink & Blue-grey',
      color: 'rgba(233, 30, 99, 1)'
    },
    {
      name: 'Purple',
      color: 'rgba(103, 58, 183, 1)'
    },
    {
      name: 'Indigo Pink',
      color: 'rgba(63, 81, 181, 1)'
    },
    {
      name: "Amber",
      color: 'rgba(254, 178, 4, 1)'
    },
    {
      name: "Deep Amber",
      color: 'rgba(255, 133, 3, 1)'
    }

  ]

  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sidebarService: SideBarService,
    private configurationService: ConfigurationService,
    private themeService: ThemeService,
    private locationService: LocationService
  ) {
  }
  ngOnInit(): void {

    this.interval = setInterval(() => {
      this.currentDate = new Date();
      this.checkForTimelightAndDayLight();
    }, 1000);

    this.setInitialTheme();
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this._subject))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.darkMode = configuration.darkMode;
        this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
      });
  }

  private checkForTimelightAndDayLight(): void {

  }

  private setInitialTheme(): void {
    const theme: string = localStorage.getItem("themeColor");
    if(theme) this.changeThemeColor(theme);
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
    if(this.interval) {
      clearInterval(this.interval);
    }
  }

  logout(): void {
    this.authenticationService.logout();
  }

  toggleDarkMode(): void {
    this.configuration.darkMode = !this.sharedService.darkMode;
    this.sharedService.activateLoadingSpinner();
    this.configurationService
      .updateConfiguration(this.configuration)
      .pipe(takeUntil(this._subject))
      .subscribe(() => {
        this.sharedService.changeTheme(this.configuration.darkMode);
        this.sharedService.checkLoadingSpinner();
      },
      () => this.sharedService.checkLoadingSpinner());
  }

  changeThemeColor(color: string): void {
    const root: HTMLElement = document.documentElement;
    root.style.setProperty('--light', color);
    localStorage.setItem("themeColor", color);
    this.themeService.next(color);
  }
}
