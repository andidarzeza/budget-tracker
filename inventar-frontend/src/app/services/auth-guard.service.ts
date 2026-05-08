import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  private readonly router = inject(Router);

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
