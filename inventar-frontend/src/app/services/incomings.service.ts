import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Income } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any, sort: any, params: HttpParams): Observable<any> {
    params  = params ?? new HttpParams().append("page", page).append("size", size).append("sort", sort);
    return this.http.get(`${serverAPIURL}/api/incomes`, {
      params,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/incomes/${id}`);
  }

  save(income: Income): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/incomes/`, income, {observe: 'response'});
  }

  update(id: string, income: Income): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/incomes/${id}`, income, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/incomes/${id}`, {observe: 'response'});
  }
}
