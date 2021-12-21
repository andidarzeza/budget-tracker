import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  pageTitle = 'Lista e Librave';
  fullScreenMode = false;
  interval = null;
  constructor(public sharedService: SharedService, public authenticationService: AuthenticationService) { 
  }

  currentDate = new Date();
  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if(this.interval) {
      clearInterval(this.interval);
    }
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  toggleFullScreenMode(): void {
    if(this.fullScreenMode) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    this.fullScreenMode = !this.fullScreenMode;
  }

}
