import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { IConfiguration } from './models/IConfiguration';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { SharedService } from './services/shared.service';
import { SideBarService } from './services/side-bar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'inventar-front-end';
  success = true;
  error = false;
  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    private configurationService: ConfigurationService, 
    public sideBarService: SideBarService
  ) {

  }

  ngOnInit(): void {   
    this.configurationService.getConfiguration().subscribe((configuration: IConfiguration) => {
      this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
    });
    this.sharedService.listenForThemeChange();
  }

  toggleSidebar(): void {
    this.sideBarService.toggleSideBar();
  }

}
