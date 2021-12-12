import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor(private http: HttpClient) { }

  getRankingTable(page: number, size: number): Observable<any> {
    const httpParams: HttpParams = new HttpParams().append('page', page.toString()).append('size', size.toString());
    return this.http.get(`${serverAPIURL}/api/statistics`, {params: httpParams});
  }
}
