import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transfer } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';

/** Move money between two sources (wallets) in the active workspace. */
@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly http = inject(HttpClient);

  readonly API_URL: string = `${serverAPIURL}/api/transfers`;

  list(account: string): Observable<Transfer[]> {
    const params = new HttpParams().append('account', account);
    return this.http.get<Transfer[]>(this.API_URL, { params });
  }

  save(transfer: Transfer): Observable<Transfer> {
    return this.http.post<Transfer>(this.API_URL, transfer);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
