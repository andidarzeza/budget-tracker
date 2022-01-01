import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(private http: HttpClient) { }

  findAll(page: any, size: any, sort: any): Observable<any> {
    const options: HttpParams = new HttpParams().append("page", page).append("size", size).append("sort", sort);
    return this.http.get(`${serverAPIURL}/api/history`, {
      params: options,
      observe: 'response'
    });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/history/${id}`, {observe: 'response'});
  }
}
