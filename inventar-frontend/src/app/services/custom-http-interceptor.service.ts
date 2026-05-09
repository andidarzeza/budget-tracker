import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class CustomHttpInterceptorService implements HttpInterceptor {
  private readonly authenticationService = inject(AuthenticationService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authenticationService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token,
        },
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // 401 = bad/expired token, 403 = forbidden — either way the session
        // can no longer make authenticated calls, so drop it and bounce to
        // /login. (The backend uses 403 for both today; 401 covers future
        // hardening without needing another change here.)
        if (error.status === 401 || error.status === 403) {
          this.authenticationService.logout();
        }
        return throwError(() => error);
      }),
    );
  }
}
