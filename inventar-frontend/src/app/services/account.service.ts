import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Account } from '../models/Account';
import { IAssociate } from '../models/IAssociate';
import { IBook } from '../models/IBook';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient) { }


  getAccount(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/account/${id}`, {observe: 'response'});
  }


  addAccount(account: Account): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/account/`, account, {observe: 'response'});
  }
  
}
