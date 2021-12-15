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

  findAll(page: any, size: any, categoryType: string): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size).append("categoryType", categoryType);
    return this.http.get(`${serverAPIURL}/api/categories`, {
      params: options,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/categories/${id}`, {observe: 'response'});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/categories/${id}`, {observe: 'response'});
  }

  save(category: SpendingCategory): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/categories/`, category, {observe: 'response'});
  }

  update(category: SpendingCategory): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/categories/`, category, {observe: 'response'});
  }

}
