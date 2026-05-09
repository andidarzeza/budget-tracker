import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { User, UserRequest } from '../models/models';
import { NavBarService } from './nav-bar.service';
import { SharedService } from './shared.service';
import { SideBarService } from './side-bar.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly navBarService = inject(NavBarService);
  private readonly sideBarService = inject(SideBarService);
  /** Public so templates can still bind via `authenticationService.sharedService`. */
  readonly sharedService = inject(SharedService);

  readonly currentUserSubject = new BehaviorSubject<User>(
    AuthenticationService.readStoredUser(),
  );
  readonly currentUser: Observable<User> = this.currentUserSubject.asObservable();

  /** Active timer that fires `logout()` when the JWT's `exp` claim hits. */
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // App boot: if a stored token is already past its `exp`, drop it before
    // any HTTP call goes out so the user lands on /login instead of seeing a
    // brief flash of authed UI followed by a 401.
    const stored = this.currentUserSubject.value;
    if (stored && this.isTokenExpired(stored.token)) {
      this.clearSession();
    } else if (stored) {
      this.scheduleExpiryLogout(stored.token);
    }
  }

  ngOnDestroy(): void {
    this.clearExpiryTimer();
  }

  get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /** Returns the stored token if it's still valid; null otherwise. */
  getToken(): string | null {
    const user = this.currentUserSubject.value;
    if (!user?.token) return null;
    return this.isTokenExpired(user.token) ? null : user.token;
  }

  login(user: any) {
    return this.http.post<User>(`${serverAPIURL}/api/user/login`, user).pipe(
      tap((authenticated) => {
        // Persist user + token. `currentUser` is read by guards/interceptor.
        localStorage.setItem('currentUser', JSON.stringify(authenticated));
        this.currentUserSubject.next(authenticated);
        this.scheduleExpiryLogout(authenticated?.token);
      }),
    );
  }

  register(payload: UserRequest): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/user/register`, payload);
  }

  logout(): void {
    this.navBarService.displayNavBar = false;
    this.sideBarService.displaySidebar = false;
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Read the JWT's `exp` claim (seconds since epoch) without verifying the
   * signature — we only use this to decide when to *stop* trusting the token
   * client-side; the backend remains the source of truth on real validation.
   */
  private getExpiryMs(token: string | null | undefined): number | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const payload = JSON.parse(AuthenticationService.base64UrlDecode(parts[1]));
      return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string | null | undefined): boolean {
    const exp = this.getExpiryMs(token);
    // Treat unparseable tokens as expired so we never send garbage to the API.
    if (exp == null) return true;
    return Date.now() >= exp;
  }

  /** Replace any pending logout timer with a fresh one based on the new token. */
  private scheduleExpiryLogout(token: string | null | undefined): void {
    this.clearExpiryTimer();
    const exp = this.getExpiryMs(token);
    if (exp == null) return;
    const delay = exp - Date.now();
    if (delay <= 0) {
      this.logout();
      return;
    }
    // setTimeout maxes out around 24.8 days — well above our 7-day token, so
    // capping isn't needed here.
    this.expiryTimer = setTimeout(() => this.logout(), delay);
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer != null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private clearSession(): void {
    this.clearExpiryTimer();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('baseCurrency');
    localStorage.removeItem('account');
    this.currentUserSubject.next(null);
  }

  private static readStoredUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) as User | null;
    } catch {
      return null;
    }
  }

  /** RFC 7515 base64url → UTF-8 string. */
  private static base64UrlDecode(value: string): string {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
    return atob(padded + '='.repeat(padLen));
  }
}
