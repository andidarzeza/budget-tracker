import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Expense } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SpendingService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any, sort: any, params?: HttpParams): Observable<any> {
    params = params ?? new HttpParams();
    params = params.append("page", page).append("size", size).append("sort", sort);
    return this.http.get(`${serverAPIURL}/api/spending`, {
      params,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/spending/${id}`, {observe: 'response'});
  }

  save(expense: Expense): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/spending/`, expense, {observe: 'response'});
  }

  update(id: string, expense: Expense): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/spending/${id}`, expense, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/spending/${id}`, {observe: 'response'});
  }
}
