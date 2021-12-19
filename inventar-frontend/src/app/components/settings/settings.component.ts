import { Component, OnInit } from '@angular/core';
import { IConfiguration } from 'src/app/models/IConfiguration';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  configuration: IConfiguration = null;
  constructor(public sharedService: SharedService, private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    this.configurationService.getConfiguration().subscribe((configuration: IConfiguration) => {
      this.configuration = configuration;
      this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
    });
  }

  changeTheme(): void {
    this.configuration.darkMode = !this.configuration.darkMode;
    this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.changeTheme(this.configuration.darkMode);
    });
  }

  setAnimationLoading(): void {
    this.configuration.animationMode = !this.sharedService.isSpinnerEnabled;
    this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.isSpinnerEnabled = this.configuration.animationMode;
    });
  }

}
