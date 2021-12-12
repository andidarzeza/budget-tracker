import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IAssociate } from '../models/IAssociate';
import { IBook } from '../models/IBook';
import { SpendingCategory } from '../models/SpendingCategory';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size);
    return this.http.get(`${serverAPIURL}/api/categories`, {
      params: options,
      observe: 'response'
    });
  }


  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/categories/${id}`, {observe: 'response'});
  }

  // getAssociateBooks(id: string): Observable<any> {
  //   return this.http.get(`${serverAPIURL}/api/associate/books/${id}`, {observe: 'response'});
  // }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/categories/${id}`, {observe: 'response'});
  }

  save(associate: SpendingCategory): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/categories/`, associate, {observe: 'response'});
  }

  update(associate: SpendingCategory): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/categories/`, associate, {observe: 'response'});
  }

  // addBookToAssociate(id: string, book: IBook, from: string, to: string): Observable<any> {
  //   const httpParams:HttpParams = new HttpParams().append('from', from).append('to', to);
  //   return this.http.post(`${serverAPIURL}/api/associate/add-book/${id}`, book, {observe: 'response', params: httpParams});
  // }

  // deliverAssociateBook(id: string, deliveredOn: any, bookId: string): Observable<any> {
  //   const httpParams: HttpParams = new HttpParams().append("deliveredOn", deliveredOn).append("bookId", bookId);
  //   return this.http.post(`${serverAPIURL}/api/associate/remove-book/${id}`, null, {observe: 'response', params: httpParams});
  // }
}
