import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { History } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';
import { ReadOnlyBaseService } from '../base/read-only-base.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService extends ReadOnlyBaseService<History> {

  readonly API_URl: string = `${serverAPIURL}/api/history`;
  
  constructor(public http: HttpClient) {
    super(http);
  }
}
