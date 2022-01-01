import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private http: HttpClient) { }

  exportDashboardPDF(from: Date, to: Date): Observable<Blob> {
    const params = new HttpParams().append("from", from.toISOString()).append("to", to.toISOString());
    return this.http.get(`${serverAPIURL}/api/export/pdf/dashboard`, {responseType: 'blob', params});
  }

}
