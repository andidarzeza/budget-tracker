import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverAPIURL } from 'src/environments/environment';
import { Category, CategoryType, ResponseWrapper } from '../../models/models';
import { BaseService } from '../../core/services/base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends BaseService<Category> {

  readonly API_URl: string = `${serverAPIURL}/api/categories`;

  constructor(public http: HttpClient) { 
    super(http);
  }

  public incomeCategories(params: HttpParams): Observable<ResponseWrapper> {
    params = params.append("categoryType", CategoryType.INCOME);
    return this.findAll(params);
  }

  public expenseCategories(params: HttpParams): Observable<ResponseWrapper> {
    params = params.append("categoryType", CategoryType.INCOME);
    return this.findAll(params);
  }

}
