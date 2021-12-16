import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Incoming } from '../models/Incoming';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any, sort: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size).append("sort", sort);
    return this.http.get(`${serverAPIURL}/api/incomings`, {
      params: options,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/incomings/${id}`, {observe: 'response'});
  }

  save(spending: Incoming): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/incomings/`, spending, {observe: 'response'});
  }

  update(book: Incoming): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/incomings/`, book, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/incomings/${id}`, {observe: 'response'});
  }
}
