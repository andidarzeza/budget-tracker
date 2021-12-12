import { Component, OnInit } from '@angular/core';
import { IConfiguration } from 'src/app/models/IConfiguration';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-cilesimet',
  templateUrl: './cilesimet.component.html',
  styleUrls: ['./cilesimet.component.css']
})
export class CilesimetComponent implements OnInit {
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
