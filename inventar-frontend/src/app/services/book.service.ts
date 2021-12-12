import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IBook } from '../models/IBook';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(private http: HttpClient) { }

  getBooks(page: any, size: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size);
    return this.http.get(`${serverAPIURL}/api/book`, {
      params: options,
      observe: 'response'
    });
  }

  getBook(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/book/${id}`, {observe: 'response'});
  }

  removeBook(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/book/${id}`, {observe: 'response'});
  }

  addBook(book: IBook): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/book/`, book, {observe: 'response'});
  }

  updateBook(book: IBook): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/book/`, book, {observe: 'response'});
  }

  getAvailableBooks(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/book/available/${id}`, {observe: 'response'});
  }
}
