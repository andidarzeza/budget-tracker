import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { User, UserRequest } from '../models/models';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private router: Router, public sharedService: SharedService) {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
      this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
      return this.currentUserSubject.value;
  }

  login(username, password) {
      return this.http.post<any>(`${serverAPIURL}/api/user/login`, { username, password })
          .pipe(map(user => {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
              return user;
          }));
  }

  register(payload: UserRequest): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/user/register`, payload);
  }

  logout() {
      // remove user from local storage and set current user to null
      localStorage.removeItem('currentUser');
      localStorage.removeItem('baseCurrency');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    //   this.sharedService.checkLoadingSpinner();
  }
}
