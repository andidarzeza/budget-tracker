import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpInterceptorService implements HttpInterceptor{
  
  constructor() {}
  
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
    return next.handle(request);
  }
}
