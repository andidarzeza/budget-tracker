import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private http: HttpClient) { }

  exportDashboardPDF(): Observable<Blob> {
    return this.http.get(`${serverAPIURL}/api/export/pdf/dashboard`, {responseType: 'blob'});
  }

}
