import { animate, style, transition, trigger } from '@angular/animations';
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
  
  constructor(
    public sharedService: SharedService, 
    private configurationService: ConfigurationService
  ) { }

  ngOnInit(): void {
    this.sharedService.activateLoadingSpinner();
    this.configurationSubscription = this.configurationService.getConfiguration().subscribe((configuration: IConfiguration) => {
      this.configuration = configuration;
      this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
      this.sharedService.checkLoadingSpinner(0);
    });
  }

  changeTheme(): void {
    this.updateConfigurationSubscription?.unsubscribe();
    this.configuration.darkMode = !this.configuration.darkMode;
    this.sharedService.activateLoadingSpinner();
    this.updateConfigurationSubscription = this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.changeTheme(this.configuration.darkMode);
      this.sharedService.checkLoadingSpinner(0);
    });
  }

  setAnimationLoading(): void {
    this.spinnerSubscription?.unsubscribe();
    this.configuration.animationMode = !this.sharedService.isSpinnerEnabled;
    this.sharedService.activateLoadingSpinner();
    this.spinnerSubscription = this.configurationService.updateConfiguration(this.configuration).subscribe(() => {
      this.sharedService.isSpinnerEnabled = this.configuration.animationMode;
      this.sharedService.checkLoadingSpinner(0);
    });
  }

  ngOnDestroy(): void {
    this.spinnerSubscription?.unsubscribe();
    this.updateConfigurationSubscription?.unsubscribe();
    this.configurationSubscription?.unsubscribe();
  }

}
