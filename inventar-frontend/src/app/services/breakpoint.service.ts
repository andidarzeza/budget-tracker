import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {

  public screenSize: ScreenSize;

  constructor(
    private breakpointObserver: BreakpointObserver
  ) { 
    if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.screenSize = "mobile";
    } else if (this.breakpointObserver.isMatched(Breakpoints.Tablet)) {
      this.screenSize = "tablet";
    } else {
      this.screenSize = "desktop";
    }
    console.log(this.screenSize);
  }
}

export type ScreenSize = "mobile" | "tablet" | "desktop";
