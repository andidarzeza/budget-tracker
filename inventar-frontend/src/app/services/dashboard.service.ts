import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }


  getDailyExpenses(from: Date, to: Date): Observable<any> {
    const httpParams = new HttpParams()
      .append("user", this.authenticationService.currentUserValue?.username)
      .append("from", from.toISOString())
      .append("to", to.toISOString());
    return this.http.get(`${serverAPIURL}/api/dashboard`, {observe: 'response', params: httpParams});
  }

  getCategoriesData(from: Date, to: Date): Observable<any> {
    const httpParams = new HttpParams()
      .append("user", this.authenticationService.currentUserValue?.username)
      .append("from", from.toISOString())
      .append("to", to.toISOString());
    return this.http.get(`${serverAPIURL}/api/dashboard/categories`, {observe: 'response', params: httpParams});
  }

  getIncomeCategoriesData(from: Date, to: Date): Observable<any> {
    const httpParams = new HttpParams()
      .append("user", this.authenticationService.currentUserValue?.username)
      .append("from", from.toISOString())
      .append("to", to.toISOString());
    return this.http.get(`${serverAPIURL}/api/dashboard/incomes`, {observe: 'response', params: httpParams});
  }
}
