import { Component, OnDestroy, OnInit } from '@angular/core';
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

  appearanceOptions: DropdownOption[] = [
    {
      icon: 'color_lens',
      title: 'Theme'
    },
    {
      icon: 'nights_stay',
      title: 'Dark Mode'
    },
    {
      icon: 'language',
      title: 'Language'
    }
  ];

  constructor(
    public sharedService: SharedService,
    private configurationService: ConfigurationService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService
  ) { }

  ngOnInit(): void {
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
