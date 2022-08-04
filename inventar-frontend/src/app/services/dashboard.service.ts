import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { DashboardDTO } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly API_URl: string = `${serverAPIURL}/api/dashboard`;
  
  constructor(private http: HttpClient) {
    
  }

  getDashboardData(from: Date, to: Date): Observable<DashboardDTO> {
    const httpParams = new HttpParams()
      .append("from", from.toISOString())
      .append("to", to.toISOString());
    return this.http.get<DashboardDTO>(this.API_URl, {observe: 'body', params: httpParams});
  }

}
