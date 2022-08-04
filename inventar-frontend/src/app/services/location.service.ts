import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    public http: HttpClient
  ) { }
  requestUrl = "http://ip-api.com/json";

  getCurrentLocation(): Observable<any> {
    return this.http.get(this.requestUrl);
  }
}
