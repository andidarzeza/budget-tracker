import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IAssociate } from '../models/IAssociate';
import { IBook } from '../models/IBook';

@Injectable({
  providedIn: 'root'
})
export class AssociateService {
  constructor(private http: HttpClient) { }

  getAssociates(page: any, size: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size);
    return this.http.get(`${serverAPIURL}/api/associate`, {
      params: options,
      observe: 'response'
    });
  }


  getAssociate(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/associate/${id}`, {observe: 'response'});
  }

  getAssociateBooks(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/associate/books/${id}`, {observe: 'response'});
  }

  removeAssociate(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/associate/${id}`, {observe: 'response'});
  }

  addAssociate(associate: IAssociate): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/associate/`, associate, {observe: 'response'});
  }
  updateAssociate(associate: IAssociate): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/associate/`, associate, {observe: 'response'});
  }

  addBookToAssociate(id: string, book: IBook, from: string, to: string): Observable<any> {
    const httpParams:HttpParams = new HttpParams().append('from', from).append('to', to);
    return this.http.post(`${serverAPIURL}/api/associate/add-book/${id}`, book, {observe: 'response', params: httpParams});
  }

  deliverAssociateBook(id: string, deliveredOn: any, bookId: string): Observable<any> {
    const httpParams: HttpParams = new HttpParams().append("deliveredOn", deliveredOn).append("bookId", bookId);
    return this.http.post(`${serverAPIURL}/api/associate/remove-book/${id}`, null, {observe: 'response', params: httpParams});
  }
}
