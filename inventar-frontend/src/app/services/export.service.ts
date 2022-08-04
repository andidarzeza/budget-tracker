import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  readonly API_URl: string = `${serverAPIURL}/api/export`;

  constructor(private http: HttpClient) {
  }

  exportDashboardPDF(from: Date, to: Date): Observable<Blob> {
    const params = new HttpParams().append("from", from.toISOString()).append("to", to.toISOString());
    return this.http.get(`${this.API_URl}/pdf/dashboard`, {responseType: 'blob', params});
  }

}
