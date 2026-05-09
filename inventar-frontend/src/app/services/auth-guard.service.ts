import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);

  canActivate(): boolean {
    // `getToken()` returns null if the JWT is missing or already past its
    // `exp`, so an expired session redirects to /login instead of falling
    // through to a guarded route and triggering a 401.
    if (!this.authenticationService.getToken()) {
      this.authenticationService.logout();
      return false;
    }
    return true;
  }
}
