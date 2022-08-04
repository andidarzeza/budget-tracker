import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReadOnlyBaseService } from 'src/app/core/services/read-only-base.service';
import { History } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService extends ReadOnlyBaseService<History> {

  readonly API_URl: string = `${serverAPIURL}/api/history`;
  
  constructor(public http: HttpClient) {
    super(http);
  }
}
