import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from './models/models';
import { AuthenticationService } from './services/authentication.service';
import { ConfigurationService } from './services/configuration.service';
import { SharedService } from './services/shared.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private subject = new Subject();

  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.configurationService
      .getConfiguration()
      .pipe(takeUntil(this.subject))
      .subscribe((configuration: IConfiguration) => {
        localStorage.setItem("baseCurrency", configuration.baseCurrency);
        this.sharedService.theme = configuration.darkMode? 'dark' : 'light'
      });
    this.sharedService.listenForThemeChange();
  }

  ngOnDestroy(): void {
    this.subject.next();
    this.subject.complete();
  }

}
