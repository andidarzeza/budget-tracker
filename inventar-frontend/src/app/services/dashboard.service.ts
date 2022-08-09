import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { DashboardDTO, RangeType } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly API_URl: string = `${serverAPIURL}/api/dashboard`;
  
  constructor(private http: HttpClient) {
    
  }

  getDashboardData(from: Date, to: Date, range: RangeType): Observable<DashboardDTO> {
    const params = new HttpParams()
      .append("from", from.toISOString())
      .append("to", to.toISOString())
      .append("range", range);
    return this.http.get<DashboardDTO>(this.API_URl, {params});
  }

}
