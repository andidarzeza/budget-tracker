import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Income } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService extends BaseService<Income> {

  readonly API_URl: string = `${serverAPIURL}/api/income`;

  constructor(public http: HttpClient) {
    super(http);
  }
}
