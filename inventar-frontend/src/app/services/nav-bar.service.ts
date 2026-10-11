import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavBarService {
  // Signal-backed so the shell re-renders when a page shows / hides the bar
  // (the app runs without zone.js).
  private readonly visible = signal(false);

  get displayNavBar(): boolean {
    return this.visible();
  }

  set displayNavBar(value: boolean) {
    this.visible.set(value);
  }
}
