import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  pageTitle = 'Lista e Librave';
  fullScreenMode = false;
  interval = null;
  constructor(public sharedService: SharedService) { }

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

  toggleFullScreenMode(): void {
    if(this.fullScreenMode) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    this.fullScreenMode = !this.fullScreenMode;
  }

}
