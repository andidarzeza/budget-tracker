import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { Account } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  readonly API_URl: string = `${serverAPIURL}/api/account`;
  account: Account;

  constructor(public http: HttpClient) {
  }

  getAccount(): Observable<any> {
    return this.http.get(this.API_URl, {observe: 'response'}).pipe(map(account => this.account = account.body as any));
  }
}
