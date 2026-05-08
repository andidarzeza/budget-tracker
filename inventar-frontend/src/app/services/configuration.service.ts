import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { IConfiguration } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);

  readonly API_URl: string = `${serverAPIURL}/api/configuration`;
  configuration: IConfiguration;

  updateConfiguration(): Observable<any> {
    delete this.configuration['user'];
    return this.http.put(this.API_URl, this.configuration);
  }

  getConfiguration(): Observable<any> {
    return this.http
      .get(this.API_URl)
      .pipe(
        map((configuration: any) => {
          this.configuration = configuration;
          return configuration;
        })
      );
  }
}
