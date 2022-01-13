import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpInterceptorService implements HttpInterceptor{
  
  constructor(private authenticationService: AuthenticationService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser?.token){
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + currentUser.token
        }
      });
    }else{
      console.log("Token is not avaible");
    }
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => event),
      catchError((error: HttpErrorResponse) => {
        if(error.status === 403) {
          // redirect home   
          this.authenticationService.logout();
        }
        return throwError(error);
      })
    );
  }
}
