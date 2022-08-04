import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverAPIURL } from 'src/environments/environment';
import { Category } from '../../models/models';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends BaseService<Category> {

  readonly API_URl: string = `${serverAPIURL}/api/categories`;

  constructor(public http: HttpClient) { 
    super(http);
  }

}
