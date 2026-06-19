import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Wallet } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';

/** Money sources (bank accounts and cash holdings) for the active workspace. */
@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly http = inject(HttpClient);

  readonly API_URL: string = `${serverAPIURL}/api/wallets`;

  list(account: string): Observable<Wallet[]> {
    const params = new HttpParams().append('account', account);
    return this.http.get<Wallet[]>(this.API_URL, { params });
  }

  save(wallet: Wallet): Observable<Wallet> {
    return this.http.post<Wallet>(this.API_URL, wallet);
  }

  update(id: string, wallet: Wallet): Observable<Wallet> {
    return this.http.put<Wallet>(`${this.API_URL}/${id}`, wallet);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
