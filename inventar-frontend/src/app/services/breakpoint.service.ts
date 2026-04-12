import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {

  public screenSize: ScreenSize;

  /**
   * Same breakpoint as `useTableCardLayout$`: add/create dialogs use fullscreen + keypad wizard on mobile.
   */
  matchesMobileCreateLayout(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }

  /**
   * When true, data tables render as stacked cards instead of row columns (phones / narrow screens).
   */
  readonly useTableCardLayout$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 767px)')
    .pipe(
      map((state) => state.matches),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  constructor(
    private breakpointObserver: BreakpointObserver
  ) {
    this.recomputeScreenSize();
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Tablet,
        Breakpoints.Medium,
        Breakpoints.Large
      ])
      .subscribe(() => this.recomputeScreenSize());
  }

  private recomputeScreenSize(): void {
    if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.screenSize = 'mobile';
    } else if (
      this.breakpointObserver.isMatched(Breakpoints.Small) ||
      this.breakpointObserver.isMatched(Breakpoints.Tablet)
    ) {
      this.screenSize = 'tablet';
    } else {
      this.screenSize = 'desktop';
    }
  }
}

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';
