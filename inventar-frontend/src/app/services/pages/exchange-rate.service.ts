import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

/** One stored daily snapshot (Iliria98). `sell` is ALL per 1 unit of `currency`. */
export interface ExchangeRate {
  id: string;
  currency: string;
  /** yyyy-MM-dd */
  date: string;
  buy: number;
  sell: number;
  source: string;
  fetchedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly http = inject(HttpClient);
  readonly API_URl: string = `${serverAPIURL}/api/exchange-rates`;

  latest(currency = 'EUR'): Observable<ExchangeRate> {
    return this.http.get<ExchangeRate>(`${this.API_URl}/latest`, { params: { currency } });
  }

  history(currency = 'EUR', from?: string, to?: string): Observable<ExchangeRate[]> {
    let params = new HttpParams().set('currency', currency);
    if (from && to) params = params.set('from', from).set('to', to);
    return this.http.get<ExchangeRate[]>(this.API_URl, { params });
  }

  refresh(currency = 'EUR'): Observable<ExchangeRate> {
    return this.http.post<ExchangeRate>(`${this.API_URl}/refresh`, null, { params: { currency } });
  }
}
