import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { Account, SimplifiedAccount } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  readonly API_URl: string = `${serverAPIURL}/api/account`;
  account: Account = null;

  constructor(public http: HttpClient) {
  }

  findAllAccountsSimplified(): Observable<SimplifiedAccount[]> {
    return this.http.get<SimplifiedAccount[]>(`${this.API_URl}/simplified`);
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${this.API_URl}/${id}`).pipe(map(account => {
      this.account = account as any;
      localStorage.setItem("account", this.account.id)
    }));
  }

  getAccount(): string {
    return localStorage.getItem("account");
  }

}
