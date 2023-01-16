import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {

  public screenSize: ScreenSize;

  constructor(
    private breakpointObserver: BreakpointObserver
  ) { 
    if(this.breakpointObserver.isMatched('(max-width: 640px)')) {
      this.screenSize = "mobile";
    } else if (this.breakpointObserver.isMatched('(max-width: 1007px)')) {
      this.screenSize = "tablet";
    } else {
      this.screenSize = "desktop";
    }
    console.log(this.screenSize);
  }
}

export type ScreenSize = "mobile" | "tablet" | "desktop";
