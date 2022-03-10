import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {

  private requestURL = 'https://api.exchangerate.host/latest';
  constructor(private http: HttpClient) { }

  getExchangeRates(): XMLHttpRequest {
    var request = new XMLHttpRequest();
    request.open('GET', this.requestURL);
    request.responseType = 'json';
    request.send();
    return request;
  }
}
