import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouteSpinnerService {
  private readonly _loading = signal(false);

  /** Read-only signal for templates: `routeSpinnerService.loading()`. */
  readonly loading = this._loading.asReadonly();

  startLoading(): void {
    this._loading.set(true);
  }

  stopLoading(): void {
    this._loading.set(false);
  }
}
