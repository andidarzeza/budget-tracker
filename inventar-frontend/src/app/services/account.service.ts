import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService) { }

  getAccount(): Observable<any> {
    const username = this.authenticationService.currentUserValue?.username;
    return this.http.get(`${serverAPIURL}/api/account/${username}`, {observe: 'response'});
  }
}
