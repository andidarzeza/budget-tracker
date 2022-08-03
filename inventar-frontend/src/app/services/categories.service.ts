import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Category, CategoryType } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any, categoryType: CategoryType, sort?: string, params?: HttpParams): Observable<any> {
    params =  (params ?? new HttpParams()).append("page", page).append("size", size).append("categoryType", categoryType.toString());
    if(sort) {
      params = params.append("sort", sort);
    }
    return this.http.get(`${serverAPIURL}/api/categories`, {
      params,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<Category> {
    return this.http.get<Category>(`${serverAPIURL}/api/categories/${id}`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${serverAPIURL}/api/categories/${id}`, {observe: 'response'});
  }

  save(category: Category): Observable<any> {
    return this.http.post(`${serverAPIURL}/api/categories/`, category, {observe: 'response'});
  }

  update(category: Category): Observable<any> {
    return this.http.put(`${serverAPIURL}/api/categories/`, category, {observe: 'response'});
  }
}
