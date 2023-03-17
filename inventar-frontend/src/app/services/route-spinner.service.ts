import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouteSpinnerService {
  private _loading = false;
  constructor() { }

  startLoading(): void {
    this._loading = true;
  }

  stopLoading(): void {
    this._loading = false;
  }

  public get loading() {
    return this._loading;
  }

}
