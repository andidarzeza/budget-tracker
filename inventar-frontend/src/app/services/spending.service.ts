import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IBook } from '../models/IBook';
import { Spending } from '../models/Spending';

@Injectable({
  providedIn: 'root'
})
export class SpendingService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size);
    return this.http.get(`${serverAPIURL}/api/spending`, {
      params: options,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/spending/${id}`, {observe: 'response'});
  }

  save(spending: Spending): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/spending/`, spending, {observe: 'response'});
  }

  update(book: Spending): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/spending/`, book, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/spending/${id}`, {observe: 'response'});
  }

}
