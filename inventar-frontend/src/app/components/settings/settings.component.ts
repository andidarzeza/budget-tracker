import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IConfiguration } from 'src/app/models/IConfiguration';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  configuration: IConfiguration = null;
  private configurationSubscription: Subscription = null;
  private updateConfigurationSubscription: Subscription = null;
  private spinnerSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    this.configurationSubscription = this.configurationService.getConfiguration().subscribe((configuration: IConfiguration) => {
      this.configuration = configuration;
      this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
    });
  }

  changeTheme(): void {
    this.unsubscribe(this.updateConfigurationSubscription);
    this.configuration.darkMode = !this.configuration.darkMode;
    this.updateConfigurationSubscription = this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.changeTheme(this.configuration.darkMode);
    });
  }

  setAnimationLoading(): void {
    this.unsubscribe(this.spinnerSubscription);
    this.configuration.animationMode = !this.sharedService.isSpinnerEnabled;
    this.spinnerSubscription = this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.isSpinnerEnabled = this.configuration.animationMode;
    });
  }

  private unsubscribe(subscription: Subscription): void {
    if(subscription) {
      subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe(this.spinnerSubscription);
    this.unsubscribe(this.updateConfigurationSubscription);
    this.unsubscribe(this.configurationSubscription);
  }

}
