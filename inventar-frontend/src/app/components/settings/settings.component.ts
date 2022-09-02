import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from 'src/app/models/models';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { DropdownOption } from 'src/app/template/shared/dropdown/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  configuration: IConfiguration = null;


  private subject = new Subject();
  appearancePath = "/settings/appearance";
  appearanceOptions: DropdownOption[] = [
    {
      icon: 'color_lens',
      title: 'Theme',
      path: 'theme'
    },
    {
      icon: 'nights_stay',
      title: 'Dark Mode',
      path: 'dark-mode',
      showSwitch: true,
      switchValue: true
    },
    {
      icon: 'language',
      title: 'Language',
      path: 'language'
    }
  ];

  accountPath = "/settings/account";
  accountOptions: DropdownOption[] = [
    {
      icon: 'account_circle',
      title: 'Account',
      path: 'account'
    },
    {
      icon: 'supervisor_account',
      title: 'Profiles',
      path: 'profiles'
    },
    {
      icon: 'delete_forever',
      title: 'Delete Account',
      path: 'delete-account'
    }
  ];


  selectedPath = this.appearancePath;
  simplifiedPath = this.selectedPath.split("/")[this.selectedPath.split("/").length - 1];
  selectedTab = this.appearanceOptions[0].path;

  constructor(
    public sharedService: SharedService,
    private configurationService: ConfigurationService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.router.navigate([this.selectedPath]);
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.subject))
      .subscribe((configuration: IConfiguration) => {
        this.configuration = configuration;
        this.sharedService.theme = configuration.darkMode ? 'dark' : 'light';
      });
  }
  
  onNavigation(path: string): void {
    this.selectedTab = path;
  }
  
  changeTheme(): void {
    this.configuration.darkMode = !this.configuration.darkMode;
    this.configurationService
      .updateConfiguration(this.configuration)
      .pipe(takeUntil(this.subject))
      .subscribe(() => {
        this.sharedService.changeTheme(this.configuration.darkMode);
      });
  }

  ngOnDestroy(): void {
    this.subject.next();
    this.subject.complete();
  }
}
