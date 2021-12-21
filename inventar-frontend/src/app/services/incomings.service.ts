import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Incoming } from '../models/Incoming';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  findAll(page: any, size: any, sort: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size).append("sort", sort).append("user", this.authenticationService.currentUserValue.username);
    return this.http.get(`${serverAPIURL}/api/incomings`, {
      params: options,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/incomings/${id}`, {observe: 'response'});
  }

  save(income: Incoming): Observable<any> {
    income['user'] = this.authenticationService.currentUserValue?.username;
    return this.http.post(`${serverAPIURL}/api/incomings/`, income, {observe: 'response'});
  }

  update(income: Incoming): Observable<any> {
    income['user'] = this.authenticationService.currentUserValue?.username;
    return this.http.put(`${serverAPIURL}/api/incomings/`, income, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/incomings/${id}`, {observe: 'response'});
  }
}
