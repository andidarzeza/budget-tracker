import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { DropdownOption } from 'src/app/template/shared/dropdown/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent extends Unsubscribe implements OnInit {
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
      switchValue: this.sharedService.theme == 'dark',
      onSwitchChange: (value) => {
        this.changeTheme(value);
      }
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
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    private router: Router,
    private configurationService: ConfigurationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.router.navigate([this.selectedPath]);
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.sharedService.themeSubscribable.subscribe(theme => {
      this.appearanceOptions.filter(item => item.title === "Dark Mode")[0].switchValue = theme == 'dark';
    });
  }
  
  changeTheme(value: boolean): void {
    this.configurationService.configuration.darkMode = value;
    this.configurationService
      .updateConfiguration()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.sharedService.changeTheme();
      });
  }

  onNavigation(path: string): void {
    this.selectedTab = path;
  }
}
