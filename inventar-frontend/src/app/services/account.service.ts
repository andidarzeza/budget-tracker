import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { Account, SimplifiedAccount } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);

  readonly API_URl: string = `${serverAPIURL}/api/account`;
  account: Account = null;

  findAllAccountsSimplified(): Observable<SimplifiedAccount[]> {
    return this.http.get<SimplifiedAccount[]>(`${this.API_URl}/simplified`);
  }

  findOne(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.API_URl}/${id}`).pipe(map(account => {
      this.account = account;
      if (account?.id) {
        localStorage.setItem("account", account.id);
      }
      return account;
    }));
  }

  /** Replace the account's per-currency balance map. Used by the dashboard "Edit balance" dialog. */
  setBalance(id: string, balance: Record<string, number>): Observable<Account> {
    return this.http.put<Account>(`${this.API_URl}/${id}/balance`, balance).pipe(
      map(account => {
        this.account = account;
        return account;
      })
    );
  }

  getAccount(): string {
    return localStorage.getItem("account");
  }

}
