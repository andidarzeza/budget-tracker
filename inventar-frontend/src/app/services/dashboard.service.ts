import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { DashboardDTO } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  constructor(private http: HttpClient) { }

  getDashboardData(from: Date, to: Date): Observable<DashboardDTO> {
    const httpParams = new HttpParams()
      .append("from", from.toISOString())
      .append("to", to.toISOString());
    return this.http.get<DashboardDTO>(`${serverAPIURL}/api/dashboard`, {observe: 'body', params: httpParams});
  }

}
