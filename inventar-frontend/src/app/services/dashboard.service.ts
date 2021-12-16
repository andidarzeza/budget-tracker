import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }


  getDailySpendings(): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/dashboard`, {observe: 'response'});
  }

  getCategoriesData(): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/dashboard/categories`, {observe: 'response'});
  }
  
}
