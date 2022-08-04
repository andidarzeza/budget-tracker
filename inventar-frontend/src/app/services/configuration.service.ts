import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { IConfiguration } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  readonly API_URl: string = `${serverAPIURL}/api/configuration`;

  constructor(private http: HttpClient) {
    
  }

  updateConfiguration(configuration: IConfiguration): Observable<any> {
    delete configuration['user'];
    return this.http.put(this.API_URl, configuration);
  }
  
  getConfiguration(): Observable<any> {
    return this.http.get(this.API_URl);
  }
}
