import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IConfiguration } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  constructor(private http: HttpClient) { }

  updateConfiguration(configuration: IConfiguration): Observable<any> {
    delete configuration['user'];
    return this.http.put(`${serverAPIURL}/api/configuration`, configuration);
  }
  
  getConfiguration(): Observable<any> {
    return this.http.get(`${serverAPIURL}/api/configuration`);
  }
}
