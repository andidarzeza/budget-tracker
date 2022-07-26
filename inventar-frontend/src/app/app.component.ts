import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { IConfiguration } from './models/models';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { ExchangeService } from './services/exchange.service';
import { SharedService } from './services/shared.service';
import { SideBarService } from './services/side-bar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class AppComponent implements OnInit {
  title = 'inventar-front-end';
  success = true;
  error = false;
  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    private configurationService: ConfigurationService, 
    public sideBarService: SideBarService,
    private exchangeService: ExchangeService
  ) {

  }

  ngOnInit(): void {

    const request = this.exchangeService.getExchangeRates();
    request.onload = () => {
      const response = request.response;
      console.log(response);
    }
    this.configurationService.getConfiguration().subscribe((configuration: IConfiguration) => {
      this.sharedService.theme = configuration.darkMode? 'dark' : 'light';
    });
    this.sharedService.listenForThemeChange();
  }

  toggleSidebar(): void {
    this.sideBarService.toggleSideBar();
  }

}
